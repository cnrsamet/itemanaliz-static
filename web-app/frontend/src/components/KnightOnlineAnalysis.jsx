import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const HeatmapChart = ({ data }) => {
    if (!data || !data.correlation_matrix) {
        return <div className="text-center text-[#e2e8f0]">Korelasyon verisi bulunamadı</div>;
    }

    const matrix = data.correlation_matrix;
    const features = Object.keys(matrix);

    return (
        <div className="w-full">
            <div className="text-center text-[#e2e8f0] mb-4">Korelasyon Matrisi</div>
            <div className="grid grid-cols-6 gap-1">
                <div className="text-[#fdb377] text-xs font-bold p-2"></div>
                {features.map(feature => (
                    <div key={feature} className="text-[#fdb377] text-xs font-bold p-2 text-center">
                        {feature}
                    </div>
                ))}
                
                {features.map(feature1 => (
                    <React.Fragment key={feature1}>
                        <div className="text-[#fdb377] text-xs font-bold p-2">
                            {feature1}
                        </div>
                        {features.map(feature2 => {
                            const value = matrix[feature1][feature2];
                            const intensity = Math.abs(value);
                            const color = value >= 0 ? '#fdb377' : '#c0976a';
                            const bgColor = `rgba(253, 179, 119, ${intensity * 0.8})`;
                            
                            return (
                                <div
                                    key={`${feature1}-${feature2}`}
                                    className="p-2 text-xs text-center border border-[#444]"
                                    style={{
                                        backgroundColor: bgColor,
                                        color: intensity > 0.5 ? '#1a1a1a' : '#e2e8f0'
                                    }}
                                >
                                    {value.toFixed(2)}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const ScatterPlot = ({ data, xKey, yKey, title }) => {
    let scatterData = [];
    
    if (data?.durability_attack && xKey === "Attack Power" && yKey === "Max Durability") {
        scatterData = data.durability_attack;
    } else if (data?.top_10_power_per_weight && xKey === "Attack Power" && yKey === "Effective Range") {
        scatterData = data.top_10_power_per_weight.map(item => ({
            "Attack Power": item["Attack Power"],
            "Effective Range": item["Effective Range"]
        }));
    }

    if (scatterData.length === 0) {
        return (
            <div className="text-center text-[#e2e8f0]">
                <p>{title}</p>
                <p className="text-sm text-[#c0976a] mt-2">
                    Veri bulunamadı
                </p>
            </div>
        );
    }

    return (
        <ScatterChart width={600} height={300} data={scatterData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
                type="number" 
                dataKey={xKey} 
                name={xKey} 
                stroke="#e2e8f0"
                domain={['dataMin', 'dataMax']}
            />
            <YAxis 
                type="number" 
                dataKey={yKey} 
                name={yKey} 
                stroke="#e2e8f0"
                domain={['dataMin', 'dataMax']}
            />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#2d2c3a', 
                    border: '1px solid #444',
                    color: '#e2e8f0'
                }}
            />
            <Scatter dataKey={yKey} fill="#fdb377" />
        </ScatterChart>
    );
};

const HistogramChart = ({ data, feature }) => {
    if (!data || !data.distributions || !data.distributions[feature]) {
        return <div className="text-center text-[#e2e8f0]">Dağılım verisi bulunamadı</div>;
    }

    const distribution = data.distributions[feature];
    const { min, max, mean, std } = distribution;
    
    const buckets = [];
    const bucketCount = 10;
    const bucketSize = (max - min) / bucketCount;
    
    for (let i = 0; i < bucketCount; i++) {
        const bucketStart = min + (i * bucketSize);
        const bucketEnd = bucketStart + bucketSize;
        const bucketMid = (bucketStart + bucketEnd) / 2;
        
        let frequency = 0;
        
        if (feature === "Attack Power" && data.durability_attack) {
            frequency = data.durability_attack.filter(item => 
                item["Attack Power"] >= bucketStart && item["Attack Power"] < bucketEnd
            ).length;
        } else if (feature === "Effective Range" && data.top_10_power_per_weight) {
            frequency = data.top_10_power_per_weight.filter(item => 
                item["Effective Range"] >= bucketStart && item["Effective Range"] < bucketEnd
            ).length;
        } else if (feature === "Weight" && data.top_10_power_per_weight) {
            frequency = data.top_10_power_per_weight.filter(item => 
                item["Weight"] >= bucketStart && item["Weight"] < bucketEnd
            ).length;
        }
        
        buckets.push({
            range: `${bucketStart.toFixed(0)}-${bucketEnd.toFixed(0)}`,
            mid: bucketMid,
            frequency: frequency
        });
    }

    return (
        <div className="w-full">
            <div className="text-center text-[#e2e8f0] mb-4">
                {feature} Dağılımı (Histogram)
            </div>
            <div className="mb-4 text-sm text-[#c0976a]">
                <p>Ortalama: {mean.toFixed(2)}</p>
                <p>Standart Sapma: {std.toFixed(2)}</p>
                <p>Min: {min.toFixed(2)} | Max: {max.toFixed(2)}</p>
            </div>
            <BarChart width={600} height={300} data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="range" stroke="#e2e8f0" />
                <YAxis stroke="#e2e8f0" />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#2d2c3a', 
                        border: '1px solid #444',
                        color: '#e2e8f0'
                    }}
                />
                <Bar dataKey="frequency" fill="#8b5a2b" />
            </BarChart>
        </div>
    );
};

const KnightOnlineAnalysis = () => {
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState('class_counts');
    const [error, setError] = useState(null);

    const analysisOptions = [
        { id: 'class_counts', name: 'Sınıf Bazlı Item Sayıları', type: 'bar' },
        { id: 'class_attack', name: 'Sınıf Bazlı Ortalama Attack Power', type: 'bar' },
        { id: 'class_defense', name: 'Sınıf Bazlı Ortalama Defense Ability', type: 'bar' },
        { id: 'category_ratios', name: 'Kategori Oranları (%)', type: 'pie' },
        { id: 'category_attack', name: 'Kategorilere Göre Attack Power', type: 'bar' },
        { id: 'top_10_power', name: 'En Verimli 10 Silah', type: 'table' },
        { id: 'distributions', name: 'Attack Power, Effective Range ve Weight Dağılımları', type: 'histogram' },
        { id: 'range_attack', name: 'Attack Power – Effective Range İlişkisi', type: 'scatter' },
        { id: 'durability_attack', name: 'Max Durability – Attack Power İlişkisi', type: 'scatter' },
        { id: 'correlation', name: 'Önemli Özellik Korelasyonları', type: 'heatmap' }
    ];

    useEffect(() => {
        const fetchAnalysisData = async () => {
            try {
                const response = await fetch('/knight_analysis_results.json');
                if (!response.ok) {
                    throw new Error('Analiz verileri yüklenemedi');
                }
                const data = await response.json();
                setAnalysisData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysisData();
    }, []);

    const prepareBarData = (analysisType) => {
        if (!analysisData) return [];
        
        switch (analysisType) {
            case 'category_attack':
                return analysisData.category_attack_power || [];
            case 'class_defense':
                return analysisData.class_avg_defense || [];
            case 'class_attack':
                return analysisData.class_avg_attack || [];
            case 'class_counts':
                return analysisData.class_counts || [];
            default:
                return [];
        }
    };

    const preparePieData = () => {
        if (!analysisData?.category_ratios) return [];
        
        return Object.entries(analysisData.category_ratios).map(([name, value]) => ({
            name,
            value
        }));
    };

    const COLORS = ['#fdb377', '#c0976a', '#8b5a2b', '#654321', '#3d2b1f'];

    const analysisComments = {
        'class_counts': 'Knight Online\'daki sınıf bazlı ekipman dağılımı, oyunun mevcut dengesini net bir şekilde yansıtıyor. Warrior, toplam itemlerin neredeyse yarısına sahip olarak açık ara önde yer alıyor. Rogue ve Mage sınıfları, birbirine oldukça yakın sayıda iteme sahip olmalarıyla dengeli bir görünüm sergiliyor. Priest, destek rolünün doğası gereği daha sınırlı bir ekipman çeşitliliğine sahipken, Kurian ise oyuna görece yeni eklenmiş olması nedeniyle en az ekipmana sahip sınıf konumunda. Bu dağılım, PvP dengelerinden oyuncuların sınıf tercihine kadar birçok unsuru etkileyebilir; özellikle Priest ve Kurian için ekipman çeşitliliğinin artırılması, oyunun genel dengesini güçlendirecek önemli bir adım olacaktır.',
        'class_attack': 'Knight Online\'daki sınıflar arasında ortalama saldırı gücü değerleri incelendiğinde, Kurian sınıfı 198.87 ortalama ile açık ara zirvede yer alıyor. Onu 145.29 ortalama ile Warrior takip ederken, Mage 129.23 ile üçüncü sırada bulunuyor. Rogue ve Priest ise sırasıyla 120.60 ve 115.18 ortalamalarla listenin alt sıralarında yer alıyor. Bu tablo, Kurian\'ın yüksek saldırı gücü potansiyeli ile öne çıktığını, Warrior\'un ise dengeli ve güçlü bir konumda olduğunu gösteriyor. Rogue, Mage ve Priest arasındaki farklar nispeten düşük olsa da, Kurian\'ın bu seviyedeki üstünlüğü PvP\'de oyun dengesini etkileyebilecek kadar belirgin.',
        'class_defense': 'Sınıfların ortalama savunma yetenekleri incelendiğinde, Kurian 148.07 değeri ile zirvede yer alıyor. Priest 112.81 ile ikinci sırada bulunurken, Rogue (97.62) ve Warrior (97.41) birbirine çok yakın savunma ortalamalarına sahip. Mage ise 77.20 ile listenin sonunda yer alıyor. Bu veriler, önceki saldırı gücü analizleriyle birlikte değerlendirildiğinde, Kurian\'ın hem saldırı hem savunmada öne çıkan çift yönlü bir avantaja sahip olduğu görülüyor. Warrior ise saldırı gücünde ikinci, savunmada ise orta sıralarda yer alarak dengeli bir profil çiziyor. Mage\'in düşük savunma değerleri, sınıfın büyü tabanlı yüksek hasar potansiyelini dengeleyen doğal bir oyun tasarımı tercihi olarak yorumlanabilir. Priest\'in savunmada yüksek, saldırıda düşük değerleri ise destek rolünün gerekliliklerini net şekilde yansıtıyor.',
        'category_ratios': 'İtem kategorilerinin dağılımına bakıldığında, Reverse itemler %55.33 ile en büyük paya sahip. Normal itemler %42.97 ile ikinci sırada yer alırken, Rare itemler yalnızca %1.69 oranında bulunuyor. Bu tablo, oyundaki ekipmanların büyük çoğunluğunun Reverse sistemine dayandığını ve oyuncuların güçlenme sürecinde bu mekanizmanın kritik rol oynadığını gösteriyor. Normal itemler hâlâ hatırı sayılır bir orana sahip olsa da, Rare kategorisinin bu kadar düşük olması, nadir eşyaların oyun ekonomisinde ve PvP dengesinde ne kadar özel ve değerli olduğunu ortaya koyuyor.',
        'category_attack': 'Knight Online\'daki item kategorileri ortalama saldırı gücü açısından karşılaştırıldığında, Reverse kategorisi 148.52 ile açık ara önde yer alıyor. Normal itemler 120.81 ortalama ile ikinci sırada bulunurken, Rare itemler 83.11 ile en düşük ortalamaya sahip kategori konumunda. Bu durum, daha önceki oran analizinde görülen Reverse ağırlığının yalnızca sayısal bir üstünlük değil, aynı zamanda güç açısından da belirgin bir fark yarattığını ortaya koyuyor. Rare itemlerin düşük saldırı gücü ortalaması ise bu kategorinin daha çok özel etkiler, nadir özellikler veya koleksiyon değeri üzerine konumlandırıldığını düşündürüyor.',
        'top_10_power': 'Oyundaki ekipmanlar, kilo başına saldırı gücü üzerinden değerlendirildiğinde, en verimli silahların tamamının \'Bone Crasher\' ve \'Hepa\'s Bone Crasher\' serisinden oluştuğu görülüyor. Listenin zirvesinde, yalnızca 1 kilo ağırlığında olmasına rağmen 140 saldırı gücü sunan Hepa\'s Bone Crasher (+21) bulunuyor. Aynı serinin farklı yükseltme seviyeleri, çok düşük ağırlıkları sayesinde benzer şekilde üst sıralarda yer alıyor. Bu verimlilik hesabı teknik açıdan dikkat çekici olsa da, oyunun mekaniklerinde ağırlığın doğrudan bir dezavantaj yaratmaması durumunda, bu oran oyuncu performansına birebir yansımayabilir. Yine de, düşük ağırlıkta yüksek saldırı gücü sunan bu silahlar, envanter yönetimi veya sınıf bazlı kullanım esnekliği açısından avantaj sağlayabilir.',
        'distributions': 'Oyundaki ekipmanların ağırlık dağılımı incelendiğinde, büyük çoğunluğun 5–10 kilo aralığında yoğunlaştığı görülüyor. Daha yüksek ağırlığa sahip itemler oldukça nadir ve genellikle istisnai ekipmanlar arasında yer alıyor. Saldırı gücü dağılımında ise değerler, 100–150 aralığında yoğunlaşarak dengeli bir tepe noktası oluşturuyor; bu da oyundaki ekipmanların büyük kısmının orta seviyede hasar sunduğunu gösteriyor. Etkili menzil (Effective Range) dağılımı ise belirgin bir şekilde iki kutupta toplanmış durumda: kısa menzilli (1–3) ekipmanlar büyük çoğunluğu oluştururken, uzun menzilli (~40) ekipmanlar az sayıda ancak belirgin şekilde öne çıkıyor. Bu tablo, oyunun tasarımında yakın mesafe çatışmalarının baskın olduğunu, ancak uzun menzilli silahların stratejik açıdan nadir ve özel bir konumda bulunduğunu ortaya koyuyor.',
        'range_attack': 'Saldırı gücü ile etkili menzil arasındaki ilişki incelendiğinde, belirgin bir kümelenme görülüyor. Ekipmanların büyük çoğunluğu kısa menzilde (1–3) toplanmış durumda ve bu grup içinde saldırı gücü geniş bir yelpazeye yayılmış. Uzun menzilli (~40) ekipmanlar ise daha az sayıda olmasına rağmen, çoğunlukla orta–yüksek saldırı gücüne sahip. Orta menzil seviyesinde (~5–6) ise sınırlı sayıda ekipman bulunuyor. Bu dağılım, oyunun tasarımında yakın mesafeli çatışmaların baskın olduğunu, uzun menzilli silahların ise daha nadir ve stratejik kullanıma sahip olduğunu ortaya koyuyor.',
        'durability_attack': 'Maksimum dayanıklılık ile saldırı gücü arasındaki ilişkiye bakıldığında, iki değişken arasında net bir doğrusal bağ olmadığı görülüyor. Çoğu ekipman 10.000–20.000 dayanıklılık aralığında yoğunlaşırken, bu grup içinde saldırı gücü oldukça geniş bir aralıkta dağılıyor. Çok yüksek dayanıklılığa sahip (100.000 üzeri) ekipmanlar ise oldukça nadir ve saldırı gücü açısından diğerlerinden belirgin şekilde ayrışmıyor. Bu durum, dayanıklılığın doğrudan saldırı gücünü belirlemediğini, iki özelliğin oyun içinde daha çok farklı işlevlere hizmet ettiğini gösteriyor.',
        'correlation': 'Temel ekipman özellikleri arasındaki korelasyonlara bakıldığında, saldırı gücü (Attack Power) ile savunma yeteneği (Defense Ability) arasında güçlü bir negatif ilişki (-0.79) dikkat çekiyor; bu durum, yüksek saldırı gücüne sahip ekipmanların genellikle düşük savunma değerlerine, yüksek savunmalı ekipmanların ise daha düşük saldırı gücüne sahip olduğunu gösteriyor. Savunma yeteneği (Defense Ability) ile (Weight) ağırlık (0.84) ve Effective Range (0.87) arasında güçlü pozitif korelasyonlar bulunması, ağır ve uzun menzilli ekipmanların savunma açısından daha avantajlı olduğunu ortaya koyuyor. Ağırlık ile saldırı gücü arasındaki ilişki (0.36) orta seviyede pozitif olup, daha ağır ekipmanların genellikle daha yüksek saldırı gücü sunduğunu gösteriyor. Dayanıklılık ile diğer özellikler arasındaki ilişkiler ise zayıf, bu da dayanıklılığın oyunda daha bağımsız bir parametre olduğunu düşündürüyor. Kilo başına güç (Power_per_Weight) ile savunma yeteneği arasındaki negatif korelasyon (-0.71) ise hafif ekipmanların savunma açısından dezavantajlı olduğunu net bir şekilde ortaya koyuyor.'
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-[#fdb377] text-lg">Analiz verileri yükleniyor...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-8">
                Hata: {error}
            </div>
        );
    }

    const selectedOption = analysisOptions.find(option => option.id === selectedAnalysis);

    const renderChart = () => {
        try {
            switch (selectedAnalysis) {
                case 'correlation':
                    return <HeatmapChart data={analysisData} />;

                case 'durability_attack':
                    return (
                        <div className="text-center">
                            <h3 className="text-[#fdb377] text-xl font-bold mb-4">
                                Max Durability – Attack Power İlişkisi
                            </h3>
                            <img 
                                src="/images/analysis/durability_attack.png" 
                                alt="Max Durability – Attack Power İlişkisi"
                                className="max-w-full h-auto rounded-lg shadow-lg"
                            />
                        </div>
                    );

                case 'range_attack':
                    return (
                        <div className="text-center">
                            <h3 className="text-[#fdb377] text-xl font-bold mb-4">
                                Attack Power – Effective Range İlişkisi
                            </h3>
                            <img 
                                src="/images/analysis/range_attack.png" 
                                alt="Attack Power – Effective Range İlişkisi"
                                className="max-w-full h-auto rounded-lg shadow-lg"
                            />
                        </div>
                    );

                case 'distributions':
                    return (
                        <div className="space-y-8">
                            <div className="text-center">
                                <h3 className="text-[#fdb377] text-xl font-bold mb-4">
                                    Attack Power Dağılımı
                                </h3>
                                <img 
                                    src="/images/analysis/attack_power_distribution.png" 
                                    alt="Attack Power Dağılımı"
                                    className="max-w-full h-auto rounded-lg shadow-lg"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="text-[#fdb377] text-xl font-bold mb-4">
                                    Effective Range Dağılımı
                                </h3>
                                <img 
                                    src="/images/analysis/effective_range_distribution.png" 
                                    alt="Effective Range Dağılımı"
                                    className="max-w-full h-auto rounded-lg shadow-lg"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="text-[#fdb377] text-xl font-bold mb-4">
                                    Weight Dağılımı
                                </h3>
                                <img 
                                    src="/images/analysis/weight_distribution.png" 
                                    alt="Weight Dağılımı"
                                    className="max-w-full h-auto rounded-lg shadow-lg"
                                />
                            </div>
                        </div>
                    );

                case 'category_attack':
                    const categoryData = prepareBarData('category_attack');
                    return categoryData.length > 0 ? (
                        <BarChart width={600} height={300} data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="category" stroke="#e2e8f0" />
                            <YAxis stroke="#e2e8f0" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#2d2c3a', 
                                    border: '1px solid #444',
                                    color: '#e2e8f0'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="Attack Power" fill="#fdb377" />
                        </BarChart>
                    ) : (
                        <div className="text-center text-[#e2e8f0]">Veri bulunamadı</div>
                    );

                case 'category_ratios':
                    const pieData = preparePieData();
                    return pieData.length > 0 ? (
                        <PieChart width={560} height={420}>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={112}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#2d2c3a', 
                                    border: '1px solid #444',
                                    color: '#e2e8f0'
                                }}
                            />
                        </PieChart>
                    ) : (
                        <div className="text-center text-[#e2e8f0]">Veri bulunamadı</div>
                    );

                case 'class_defense':
                    const defenseData = prepareBarData('class_defense');
                    return defenseData.length > 0 ? (
                        <BarChart width={600} height={300} data={defenseData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="class" stroke="#e2e8f0" />
                            <YAxis stroke="#e2e8f0" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#2d2c3a', 
                                    border: '1px solid #444',
                                    color: '#e2e8f0'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="Defense Ability" fill="#c0976a" />
                        </BarChart>
                    ) : (
                        <div className="text-center text-[#e2e8f0]">Veri bulunamadı</div>
                    );

                case 'class_attack':
                    const attackData = prepareBarData('class_attack');
                    return attackData.length > 0 ? (
                        <BarChart width={600} height={300} data={attackData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="class" stroke="#e2e8f0" />
                            <YAxis stroke="#e2e8f0" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#2d2c3a', 
                                    border: '1px solid #444',
                                    color: '#e2e8f0'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="Attack Power" fill="#fdb377" />
                        </BarChart>
                    ) : (
                        <div className="text-center text-[#e2e8f0]">Veri bulunamadı</div>
                    );

                case 'class_counts':
                    const countData = prepareBarData('class_counts');
                    return countData.length > 0 ? (
                        <BarChart width={600} height={300} data={countData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="class" stroke="#e2e8f0" />
                            <YAxis stroke="#e2e8f0" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#2d2c3a', 
                                    border: '1px solid #444',
                                    color: '#e2e8f0'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#8b5a2b" />
                        </BarChart>
                    ) : (
                        <div className="text-center text-[#e2e8f0]">Veri bulunamadı</div>
                    );

                case 'top_10_power':
                    return (
                        <div className="w-full">
                            <h3 className="text-[#fdb377] text-xl font-bold mb-6 text-center">
                                En Verimli 10 Silah
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full bg-[#2d2c3a] rounded-lg overflow-hidden shadow-lg">
                                    <thead className="bg-[#1a1a1a]">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[#fdb377] font-bold border-b border-[#444]">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-left text-[#fdb377] font-bold border-b border-[#444]">
                                                Silah Adı
                                            </th>
                                            <th className="px-4 py-3 text-left text-[#fdb377] font-bold border-b border-[#444]">
                                                Attack Power
                                            </th>
                                            <th className="px-4 py-3 text-left text-[#fdb377] font-bold border-b border-[#444]">
                                                Weight
                                            </th>
                                            <th className="px-4 py-3 text-left text-[#fdb377] font-bold border-b border-[#444]">
                                                Verimlilik
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysisData?.top_10_power_per_weight?.slice(0, 10).map((item, index) => (
                                            <tr 
                                                key={index} 
                                                className={`hover:bg-[#1a1a1a] transition-colors ${
                                                    index % 2 === 0 ? 'bg-[#2d2c3a]' : 'bg-[#22212c]'
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-[#e2e8f0] font-medium border-b border-[#444]">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-[#fdb377] font-medium border-b border-[#444]">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 py-3 text-[#e2e8f0] border-b border-[#444]">
                                                    {item['Attack Power']}
                                                </td>
                                                <td className="px-4 py-3 text-[#e2e8f0] border-b border-[#444]">
                                                    {item.Weight}
                                                </td>
                                                <td className="px-4 py-3 text-[#c0976a] font-bold border-b border-[#444]">
                                                    {item.Power_per_Weight}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );

                default:
                    return (
                        <div className="text-center text-[#e2e8f0]">
                            <p>Analiz seçilmedi</p>
                        </div>
                    );
            }
        } catch (err) {
            console.error('Grafik render hatası:', err);
            return (
                <div className="text-center text-red-500">
                    <p>Grafik yüklenirken hata oluştu</p>
                    <p className="text-sm">{err.message}</p>
                </div>
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-lg p-4 shadow-lg">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-amber-400 font-semibold text-lg mb-2">Önemli Uyarı</h4>
                        <p className="text-[#e2e8f0] text-sm leading-relaxed">
                            Bu analizler yalnızca eğitim amaçlı hazırlanmıştır. Sonuçlar, 14.416 adet item verisine dayanmakta olup, veriler güncel olmayabilir. Bu nedenle elde edilen bulguların kesin doğruluğu garanti edilmez.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full">
                <div className="lg:w-1/4 bg-[#22212c] rounded-lg p-4 shadow-lg">
                    <h3 className="text-[#fdb377] text-lg font-bold mb-4">Analiz Seçenekleri</h3>
                    <div className="space-y-2">
                        {analysisOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedAnalysis(option.id)}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                    selectedAnalysis === option.id
                                        ? 'bg-[#2d2c3a] text-[#fdb377] shadow-md'
                                        : 'text-[#e2e8f0] hover:bg-[#2d2c3a]/50'
                                }`}
                            >
                                <div className="text-sm font-medium">{option.name}</div>
                                <div className="text-xs text-[#c0976a] mt-1">{option.type}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:w-3/4 bg-[#22212c] rounded-lg p-6 shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-[#fdb377] text-2xl font-bold mb-2">
                            {selectedOption?.name}
                        </h2>
                        <p className="text-[#e2e8f0] text-sm">
                            Analiz türü: {selectedOption?.type}
                        </p>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                        {renderChart()}
                    </div>

                    <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
                        <h4 className="text-[#fdb377] font-bold mb-4">Analiz Açıklaması</h4>
                        
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <img 
                                    src="/images/analysis/sametcnrphoto.jpeg" 
                                    alt="Samet CANER" 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-[#fdb377]"
                                />
                            </div>
                            
                            <div className="flex-1">
                                <div className="mb-2">
                                    <h5 className="text-[#fdb377] font-semibold text-lg">Samet CANER</h5>
                                </div>
                                <div className="text-[#e2e8f0] text-sm leading-relaxed text-justify">
                                    {analysisComments[selectedAnalysis] || 'Bu analiz için henüz yorum yazılmamış.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnightOnlineAnalysis; 