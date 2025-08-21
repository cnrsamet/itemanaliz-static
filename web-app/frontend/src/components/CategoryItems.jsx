import React, { useState, useEffect } from 'react';
import { itemService } from '../services/api';
import ItemsRenderer from './ItemsRenderer';
import KnightOnlineAnalysis from './KnightOnlineAnalysis';
import ErrorBoundary from './ErrorBoundary';

const CategoryItems = ({ selectedCategory }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameName, setGameName] = useState('');

    const shuffleItems = (array) => {
        const shuffledArray = [...array];
        
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        
        return shuffledArray;
    };

    useEffect(() => {
        // her kategori değişiminde state'leri sıfırla
        setItems([]);
        setLoading(true);
        setError(null);

        const loadItems = async () => {
            if (selectedCategory === 'all-items') {
                return;
            }

            if (selectedCategory === 'knight-online-analysis') {
                setLoading(false);
                return;
            }

            try {
                let gameSlug = '';
                switch (selectedCategory) {
                    case 'knight-online':
                        gameSlug = 'knight-online';
                        break;
                    case 'metin-2':
                
                        break;
                    case 'rise-online':
                        gameSlug = 'rise-online';
                        break;
                    case 'silkroad':
                        gameSlug = 'silkroad';
                        break;
                    default:
                        gameSlug = 'knight-online';
                }

                setGameName(gameSlug);

                        const itemsData = await itemService.getItemsByGameName(gameSlug);
                
                const randomizedItems = shuffleItems(itemsData);
                setItems(randomizedItems);
            } catch (err) {
                console.error('Kategoriye göre itemler yüklenirken hata:', err);
                setError(`İtemler yüklenirken bir hata oluştu: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, [selectedCategory]);

    if (selectedCategory === 'all-items') {
        return null;
    }

    if (selectedCategory === 'knight-online-analysis') {
        return (
            <ErrorBoundary>
                <KnightOnlineAnalysis />
            </ErrorBoundary>
        );
    }

    const getCategoryTitle = () => {
        switch (selectedCategory) {
            case 'knight-online':
                return 'Knight Online İtemleri';
            
        }
    };

    if (error) {
        return (
            <div className="mt-8">
                <h2 className="text-[#fdb377] text-2xl md:text-4xl font-bold mb-4">
                    {getCategoryTitle()}
                </h2>
                <div className="text-center text-red-500 p-8">{error}</div>
            </div>
        );
    }

    if (!loading && items.length === 0) {
        return (
            <div className="mt-8">
                <h2 className="text-[#fdb377] text-2xl md:text-4xl font-bold mb-4">
                    {getCategoryTitle()}
                </h2>
                <div className="text-center text-[#c0976a] p-8">
                    Bu oyunda henüz item bulunmuyor.
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h2 className="text-[#fdb377] text-2xl md:text-4xl font-bold mb-4">
                {getCategoryTitle()}
            </h2>
            <ItemsRenderer items={items} loading={loading} gameName={gameName} />
        </div>
    );
};

export default CategoryItems; 