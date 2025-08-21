import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { imageService } from '../services/api';

const ITEMS_PER_PAGE = 12;
const MAX_STATS_TO_SHOW = 6;

const ItemsRenderer = ({ items = [], loading = false }) => {
    const location = useLocation();
    const [displayItems, setDisplayItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    // son elementi gözlemle
    const lastItemRef = React.useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // items, yükleme veya location değiştiğinde sayfayı sıfırlıyoruz
    useEffect(() => {

        setPage(1);
        setHasMore(true);
        setDisplayItems([]);
    }, [items, loading, location.pathname]);

    // sayfa yenilendiğinde yeni itemleri yükle
    useEffect(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const newItems = items.slice(start, end);

        if (page === 1) {
            setDisplayItems(newItems);
        } else {
            setDisplayItems(prev => [...prev, ...newItems]);
        }

        setHasMore(end < items.length);
    }, [page, items]);

    // eğer item yoksa kullanıcıya bilgi ver
    if (!loading && items.length === 0) {
        return (
            <div className="text-center text-[#c0976a]">
                Bu oyunda henüz item bulunmuyor.
            </div>
        );
    }

    return (
        <div className="my-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayItems.map((item, index) => {
                    // orijinal ismi kaydet
                    const originalName = item.name;
                    
                    // urlfriendly item adı
                    const itemSlug = originalName.toLowerCase()
                        .replace(/\s*\(\+(\d+)\)\s*/g, '-plus-$1') 
                        .replace(/[^\w\s\-\d]/g, '') 
                        .replace(/\s+/g, '-') 
                        .replace(/-+/g, '-') 
                        .trim();



                    return (
                        <Link
                            to={`/knight-online/${itemSlug}?id=${item.id}`}
                            ref={index === displayItems.length - 1 ? lastItemRef : null}
                            key={item.id}
                            className="bg-gradient-to-b from-[#22212c] to-[#1e1d27] text-[#e2e8f0] p-6 rounded-xl shadow-lg h-[400px] transition-all hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_#fdb377] relative overflow-hidden border border-[#2d2c3a] backdrop-blur-sm item-card-pattern"
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
                    );
                })}
            </div>

            {loading && (
                <div className="text-center mt-8 text-[#e2e8f0] bg-[#22212c]/80 p-4 rounded-lg border border-[#2d2c3a]/50">
                    Yükleniyor...
                </div>
            )}

            {!hasMore && displayItems.length > 0 && (
                <div className="text-center mt-8 text-[#e2e8f0] bg-[#22212c]/80 p-4 rounded-lg border border-[#2d2c3a]/50">
                    Bütün itemler yüklendi
                </div>
            )}
        </div>
    );
};

export default ItemsRenderer;
