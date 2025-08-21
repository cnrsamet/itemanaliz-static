import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { itemService } from '../services/api';
import imageService from '../services/imageService';
import commentsData from '../data/comments.json';

const ItemDetailPage = () => {
    const { gameName, itemName } = useParams();
    const location = useLocation();
    const [item, setItem] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [randomComments, setRandomComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const fetchItemData = async () => {
        try {
            setLoading(true);
            setError(null);

            // url'den id parametresini alıyoruz
            const queryParams = new URLSearchParams(location.search);
            const itemId = queryParams.get('id');

            let itemData;
            if (itemId) {
                // id varsa direkt id ile çek
                itemData = await itemService.getItemById(itemId);
            } else {
                // id yoksa isim ile çek
                itemData = await itemService.getItemByGameAndName(gameName, itemName);
            }

            if (itemData) {
                setItem(itemData);
                document.title = `${itemData.name} - Item Analiz`;
            } else {
                setError('Item bulunamadı');
            }
        } catch (error) {
            console.error('Item verisi alınırken hata:', error);
            setError('Item yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchItemImages = async (id) => {
        try {
            const imagesData = await imageService.getImagesByItemId(id);
            setImages(imagesData);
        } catch (error) {
            console.error('Item görselleri alınırken hata:', error);
        }
    };

    const getRandomComments = () => {
        const shuffled = [...commentsData.comments].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2);
    };

    const handleCommentSubmit = () => {
        if (commentText.trim()) {
            setShowPopup(true);
            setCommentText('');
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    useEffect(() => {
        fetchItemData();
    }, [gameName, itemName, location.search]);

    useEffect(() => {
        if (item) {
            fetchItemImages(item.id);
            setRandomComments(getRandomComments());
        }
    }, [item]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#151320] flex items-center justify-center">
                <div className="text-[#fdb377] text-xl">Yükleniyor...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#151320] flex items-center justify-center">
                <div className="text-red-400 text-xl">{error}</div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-[#151320] flex items-center justify-center">
                <div className="text-red-400 text-xl">Item bulunamadı</div>
            </div>
        );
    }

    const formatGameName = (name) => {
        return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-[#151320] py-8">
            {/* Popup Overlay */}
            {showPopup && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={closePopup}
                >
                    <div 
                        className="bg-[#22212c] rounded-xl p-6 max-w-sm mx-4 relative border border-[#2d2c3a]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closePopup}
                            className="absolute top-3 right-3 text-[#e2e8f0]/50 hover:text-[#e2e8f0] transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Success Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="text-center">
                            <h3 className="text-[#fdb377] text-lg font-semibold mb-2">Yorumunuz Gönderildi</h3>
                            <p className="text-[#e2e8f0] text-sm">Belki bir gün yayınlanır.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-[#fdb377] mb-8 text-center">
                    {item.name}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative min-h-[calc(100vh-80px-140px)]">
                    <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-[#2d2c3a]/50"></div>

                    <div className="flex items-center justify-center">
                        <div className="bg-gradient-to-b from-[#22212c] to-[#1e1d27] text-[#e2e8f0] p-6 rounded-xl shadow-lg w-full max-w-md transition-all hover:shadow-[0_8px_15px_-5px_#fdb377] border border-[#2d2c3a] backdrop-blur-sm">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-lg bg-[#2d2c3a] p-1 shadow-inner">
                                    {item.image_path ? (
                                        <img
                                            src={imageService.getFullImageUrl(item.image_path)}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-md"
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

                            {item.stats && Object.keys(item.stats).length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-[#fdb377] text-lg font-semibold mb-3">Özellikler</h3>
                                    <ul className="space-y-2">
                                        {Object.entries(item.stats || {}).map(([key, value]) => (
                                            <li key={key} className="flex justify-between items-center text-sm">
                                                <span className="text-[#e2e8f0]/80">
                                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                                </span>
                                                <span className="text-[#fdb377] font-medium">{value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {images.length > 1 && (
                                <div className="mb-6">
                                    <h4 className="text-[#fdb377] text-sm font-medium mb-3">İtem Görselleri</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.map((img, index) => (
                                            <div key={img.id || index} className="aspect-square bg-[#2d2c3a] p-1 rounded-lg hover:border hover:border-[#fdb377] transition-colors cursor-pointer">
                                                <img
                                                    src={imageService.getFullImageUrl(img.image_url)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {item.description && (
                                <div className="bg-[#1e1d27]/80 rounded-lg p-4 border border-[#2d2c3a]/50">
                                    <h4 className="text-[#fdb377] text-sm font-medium mb-2">Açıklama</h4>
                                    <p className="text-[#e2e8f0] text-sm">{item.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#22212c] rounded-xl p-4 border border-[#2d2c3a]">
                            <textarea
                                placeholder="Bu item hakkında ne düşünüyorsun?"
                                className="w-full bg-[#1e1d27] text-[#e2e8f0] rounded-lg p-3 border border-[#2d2c3a] focus:outline-none focus:border-[#fdb377] resize-none h-24"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <div className="flex justify-end mt-2">
                                <button 
                                    className="bg-[#2d2c3a] text-[#fdb377] px-4 py-2 rounded-lg hover:bg-[#363445] transition-colors"
                                    onClick={handleCommentSubmit}
                                >
                                    Yorum Yap
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {randomComments.map((comment) => (
                                <div key={comment.id} className="bg-[#22212c] rounded-xl p-4 border border-[#2d2c3a]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <img 
                                            src={comment.avatar} 
                                            alt={comment.username}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span className="text-[#fdb377] font-medium">{comment.username}</span>
                                        <span className="text-[#e2e8f0]/50 text-sm">{comment.timeAgo}</span>
                                    </div>
                                    <p className="text-[#e2e8f0] mb-3">
                                        {comment.content}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-1 text-[#e2e8f0] hover:bg-[#2d2c3a]/30 p-1 rounded-full transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                            </svg>
                                            <span>{comment.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-[#e2e8f0] hover:bg-[#2d2c3a]/30 p-1 rounded-full transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                            </svg>
                                            <span>{comment.dislikes}</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-[#e2e8f0] hover:bg-[#2d2c3a]/30 p-1 rounded-full transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                            <span>Yanıtla</span>
                                        </button>
                                    </div>

                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="ml-8 space-y-4 mt-4">
                                            {comment.replies.map((reply) => (
                                                <div key={reply.id} className="bg-[#22212c] rounded-xl p-4 border border-[#2d2c3a]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <img 
                                                            src={reply.avatar} 
                                                            alt={reply.username}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                        <span className="text-[#fdb377] font-medium">{reply.username}</span>
                                                        <span className="text-[#e2e8f0]/50 text-sm">{reply.timeAgo}</span>
                                                    </div>
                                                    <p className="text-[#e2e8f0] mb-3">
                                                        {reply.content}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <button className="flex items-center gap-1 text-[#e2e8f0] hover:bg-[#2d2c3a]/30 p-1 rounded-full transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                            </svg>
                                                            <span>{reply.likes}</span>
                                                        </button>
                                                        <button className="flex items-center gap-1 text-[#e2e8f0] hover:bg-[#2d2c3a]/30 p-1 rounded-full transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                                            </svg>
                                                            <span>{reply.dislikes}</span>
                                                        </button>
                                                        <button className="flex items-center gap-1 text-[#e2e8f0] hover:bg-[#2d2c3a]/30 p-1 rounded-full transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Yanıtla</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage; 