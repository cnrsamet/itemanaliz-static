import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { itemService, imageService } from '../services/api';

const MAX_STATS_TO_SHOW = 7;
const MAX_RANDOM_ITEMS = 20;

const FeaturedRandomItems = () => {
    const swiperRef = useRef(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRandomItems = async () => {
            try {
                setLoading(true);
                // knight online için tüm itemleri çek
                const allItems = await itemService.getItemsByGameName('knight-online');
        
                
                // random olarak 20 item
                const shuffledItems = [...allItems].sort(() => 0.5 - Math.random());
                const randomItems = shuffledItems.slice(0, MAX_RANDOM_ITEMS);
                
                setItems(randomItems);
            } catch (err) {
                console.error('Random itemler yüklenirken hata:', err);
                setError('İtemler yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        loadRandomItems();
    }, []);

    const handlePrev = () => {
        swiperRef.current?.slidePrev();
    };

    const handleNext = () => {
        swiperRef.current?.slideNext();
    };

    if (loading) {
        return (
            <div className="relative">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h2 className="text-[#fdb377] text-2xl md:text-4xl font-bold">
                        Knight Online İtemleri
                    </h2>
                </div>
                <div className="text-center text-[#fdb377] p-8">Yükleniyor...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h2 className="text-[#fdb377] text-2xl md:text-4xl font-bold">
                        Knight Online İtemleri
                    </h2>
                </div>
                <div className="text-center text-red-500 p-8">{error}</div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 className="text-[#fdb377] text-2xl md:text-4xl font-bold">
                    Knight Online İtemleri
                </h2>
                <div className="flex flex-row items-center justify-between md:justify-end gap-4">
                    <Link 
                        to="/knight-online-itemler" 
                        className="bg-[#22212c] text-[#fdb377] px-4 py-2 rounded-lg hover:bg-[#2d2c3a] transition-colors border border-[#2d2c3a]"
                    >
                        Tümünü Gör
                    </Link>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            className="bg-[#22212c] hover:bg-[#2d2c3a] text-[#fdb377] p-2 rounded-lg transition-colors border border-[#2d2c3a]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-[#22212c] hover:bg-[#2d2c3a] text-[#fdb377] p-2 rounded-lg transition-colors border border-[#2d2c3a]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 -mx-4 py-12 -my-12">
                <Swiper
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                        1280: { slidesPerView: 4 },
                    }}
                >
                    {items.map((item) => {
                        // orijinal ismi kaydet
                        const originalName = item.name;
                        
                        // url-friendly item adı oluşturuyoruz
                        const itemSlug = originalName.toLowerCase()
                            .replace(/\s*\(\+(\d+)\)\s*/g, '-plus-$1') // (+3) -> -plus-3 seo için
                            .replace(/[^\w\s\-\d]/g, '') // özel karakterleri kaldır
                            .replace(/\s+/g, '-') // boşlukları tire ile değiştir
                            .replace(/-+/g, '-') // çoklu tireleri tekli tire yap
                            .trim();



                        return (
                            <SwiperSlide key={item.id}>
                                <div className="py-8 px-2">
                                    <Link
                                        to={`/knight-online/${itemSlug}?id=${item.id}`}
                                        className="bg-gradient-to-b from-[#22212c] to-[#1e1d27] text-[#e2e8f0] p-6 rounded-xl shadow-lg h-[400px] transition-all hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_#fdb377] relative overflow-hidden border border-[#2d2c3a] backdrop-blur-sm item-card-pattern block"
                                    >
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-lg bg-[#2d2c3a] p-1 shadow-inner">
                                                {item.image_path ? (
                                                    <img
                                                        src={imageService.getFullImageUrl(item.image_path)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded-md"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-md bg-[#1e1d27]/50"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold mb-1 text-right text-[#fdb377]">
                                                    {item.name}
                                                </h3>
                                                <span className="text-sm text-[#e2e8f0] block text-right">
                                                    {item.slot_type || "Genel"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-4 relative">
                                            <div className="bg-[#1e1d27]/80 rounded-lg p-4 border border-[#2d2c3a]/50">
                                                <ul className="space-y-2">
                                                    {Object.entries(item.stats || {})
                                                        .slice(0, MAX_STATS_TO_SHOW)
                                                        .map(([key, value]) => (
                                                            <li key={key} className="flex justify-between items-center text-sm">
                                                                <span className="text-[#fdb377] capitalize">
                                                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                                                </span>
                                                                <span className="font-medium text-[#e2e8f0]">{value}</span>
                                                            </li>
                                                        ))}
                                                </ul>
                                                {Object.keys(item.stats || {}).length > MAX_STATS_TO_SHOW && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1e1d27] via-[#1e1d27]/95 to-transparent pointer-events-none" />
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </div>
    );
};

export default FeaturedRandomItems; 