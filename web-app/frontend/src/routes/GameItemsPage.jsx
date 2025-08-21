import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ItemsRenderer from '../components/ItemsRenderer';
import { itemService } from '../services/api';

const shuffleItems = (array) => {
    const shuffledArray = [...array];
    
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    
    return shuffledArray;
};

const GameItemsPage = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    
    const gameName = pathname.split('-itemler')[0].substring(1);
    
    const gameNames = {
        'knight-online': 'Knight Online',
    };

    useEffect(() => {
        setItems([]);
        setLoading(true);
        setError(null);
        
        const loadItems = async () => {
            try {
                        const itemsData = await itemService.getItemsByGameName(gameName);
                
                const randomizedItems = shuffleItems(itemsData);
                setItems(randomizedItems);
            } catch (error) {
                console.error('İtemler yüklenirken hata:', error.response?.data || error.message);
                setError(`İtemler yüklenirken bir hata oluştu: ${error.response?.data?.message || error.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, [gameName, location.key]);

    useEffect(() => {
        document.title = `${gameNames[gameName]} İtemleri - itemAnaliz`;
    }, [gameName]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-[#fdb377] text-xl">{error}</div>
            </div>
        );
    }

    if (!loading && items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-[#fdb377] text-2xl md:text-4xl font-bold mb-8 text-center">
                    {gameNames[gameName]} İtemleri
                </h1>
                <div className="text-center text-[#c0976a] p-8">
                    Bu oyunda henüz item bulunmuyor.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-[#fdb377] text-2xl md:text-4xl font-bold mb-8 text-center">
                {gameNames[gameName]} İtemleri
            </h1>
            <ItemsRenderer items={items} loading={loading} gameName={gameName} />
        </div>
    );
};

export default GameItemsPage; 