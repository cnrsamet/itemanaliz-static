import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import MainCategories from '../components/MainCategories';
import FeaturedRandomItems from '../components/FeaturedRandomItems';
import CategoryItems from '../components/CategoryItems';

const HomePage = () => {
    const [currentCategory, setCurrentCategory] = useState('all-items');

    useEffect(() => {
        document.title = 'itemAnaliz - MMORPG Item Analiz';
    }, []);

    return (
        <div className="mt-4 flex flex-col gap-4">
            {/* BREADCRUMB */}
            <div className="flex gap-4"></div>
            {/* INTRODUCTION */}
            <div className="flex items-center justify-between">
                {/* tittles */}
                <div className="">
                    <h1 className="text-[#fdb377] text-2xl md:text-5xl lg:text-6xl font-bold">
                        Analiz et, Araştır, Yorum yap.
                    </h1>
                    <p className="mt-8 text-md md:text-xl text-[#e2e8f0]">
                        İtem Analiz ile ilgilendiğin oyunların itemlerini
                        rahatlıkla analiz edebilir, item hakkında diğer
                        oyunculara yorumlarını paylaşabilirsin!
                    </p>
                </div>
                {/* animated Button */}
                <Link to="/" className="hidden md:block relative">
                    <svg
                        viewBox="0 0 200 200"
                        width="200"
                        height="200"
                        className="text-lg tracking-widest animatedButton"
                    >
                        <path
                            id="circlePath"
                            fill="none"
                            d="M 100,100 m -75,0 a 75,75 0 1, 1 150,0 a 75,75 0 1,1 -150,0"
                        />
                        <text fill="#fdb377">
                            <textPath href="#circlePath" startOffset="0%">
                                •Analiz Et
                            </textPath>
                            <textPath href="#circlePath" startOffset="33%">
                                •Araştır
                            </textPath>
                            <textPath href="#circlePath" startOffset="63%">
                                •Yorum Yap
                            </textPath>
                        </text>
                    </svg>
                    <button className="absolute top-0 left-0 right-0 bottom-0 m-auto w-20 h-20 bg-[#22212c] hover:bg-[#2d2c3a] transition-colors rounded-full flex items-center justify-center border border-[#2d2c3a]">
                        <img
                            src="/sword.svg"
                            alt="Sword Icon"
                            className="w-12 h-12 text-[#fdb377]"
                        />
                    </button>
                </Link>
            </div>
            {/* CATEGORIES */}
            <MainCategories onCategoryChange={setCurrentCategory} />
            {/* FEATURED Items */}
            <div className="">
                {/* Tüm İtemler seçiliyse FeaturedRandomItems göster */}
                {currentCategory === 'all-items' && <FeaturedRandomItems />}
                
                {/* Diğer kategoriler seçiliyse CategoryItems göster */}
                <CategoryItems selectedCategory={currentCategory} />
            </div>
            {/* POST LIST */}
        </div>
    );
};

export default HomePage;
