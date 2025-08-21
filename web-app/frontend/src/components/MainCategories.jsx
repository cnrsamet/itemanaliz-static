import React, { useState } from 'react';

const MainCategories = ({ onCategoryChange }) => {
    // varsayılan olarak "Bütün İtemler" seçili
    const [selectedCategory, setSelectedCategory] = useState('all-items');

    // oyun kategorileri listesi
    const games = [
        { id: 'all-items', name: 'Bütün İtemler' },
        { id: 'knight-online-analysis', name: 'Knight Online Analysis' },
        { id: 'knight-online', name: 'Knight Online' },        
        
    ];

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId); // seçilen kategoriyi state olarak kaydet
        onCategoryChange(categoryId); // üst component'e kategoriyi bildir
    };

    return (
        <div className="hidden md:flex bg-[#22212c] rounded-3xl xl:rounded-full p-4 shadow-lg items-center justify-center gap-8">
            {/* kategori linkleri */}
            <div className="flex-1 flex items-center justify-between flex-wrap">
                {games.map((game) => (
                    <button
                        key={game.id}
                        className={`rounded-full px-4 py-2 transition-all duration-300 shadow-md hover:shadow-lg ${
                            selectedCategory === game.id
                                ? 'bg-[#2d2c3a] text-[#fdb377] shadow-[#2d2c3a]/50'
                                : 'text-[#fdb377] hover:bg-[#2d2c3a]/50 shadow-[#22212c]/50'
                        }`}
                        onClick={() => handleCategoryClick(game.id)}
                    >
                        {game.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MainCategories;
