import imageService from './imageService';

// data'da bulunan itemleri yüklüyoruz
const loadKnightItems = async () => {
    try {
        const knightItemsData = await import('../data/knight_150_items.json');
        return knightItemsData.default || knightItemsData;
    } catch (error) {
        console.error('Knight items JSON yüklenirken hata:', error);
        return [];
    }
};
// item özelliklerini parse ettik
const parseFeatures = (features) => {
    if (!features) return {};
    const featureArray = Array.isArray(features) ? features : [features];

    const stats = {};
    featureArray.forEach((feature) => {
        const [key, value] = feature.split(':').map((s) => s.trim());

        if (key && value) {
            let statKey = key
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/\s*-\s*/g, '_');

            let statValue = value;
            if (!isNaN(parseInt(value))) {
                statValue = parseInt(value);
            }

            stats[statKey] = statValue;
        }
    });

    return stats;
};

// item görseli alıyoruz
const getImagePath = (item) => {
    if (item.images && item.images.length > 0) {
        return item.images[0].src;
    }
    return null;
};

const extractGradeFromName = (name) => {
    const match = name.match(/\(\+(\d+)\)/);
    return match ? parseInt(match[1]) : null;
};



const gameService = {
    getAllGames: async () => {
        return [
            {
                id: 1,
                name: 'Knight Online',
                description: 'MMORPG oyunu',
            },
        ];
    },
    getGameByName: async (gameName) => {
        const games = {
            'knight-online': 1,
        };
        const gameId = games[gameName];

        return {
            id: gameId,
            name: 'Knight Online',
            description: 'MMORPG oyunu',
        };
    },
};
// item servisleri eşleşmeler burada yapılıyor
const itemService = {
    getAllItems: async () => {
        
        const items = await loadKnightItems();

        
        return items.map((item) => {
            return {
                id: item.id,
                name: item.name,
                type: item.class || 'Genel',
                slot_type: item.category,
                class: item.class || 'Genel',
                grade: extractGradeFromName(item.name),
                stats: parseFeatures(item.features),
                description:
                    item.description === 'NaN' ? '' : item.description || '',
                image_path: getImagePath(item),
            };
        });
    },

    getItemById: async (id) => {
        if (!id) {
            throw new Error('Item ID gerekli');
        }

        try {
           
            const items = await loadKnightItems();
            const item = items.find((i) => i.id === parseInt(id));

            if (!item) {
                throw new Error('Item bulunamadı');
            }

            
            return {
                id: item.id,
                name: item.name,
                type: item.class || 'Genel',
                slot_type: item.category,
                class: item.class || 'Genel',
                grade: extractGradeFromName(item.name),
                stats: parseFeatures(item.features),
                description:
                    item.description === 'NaN' ? '' : item.description || '',
                image_path: getImagePath(item),
            };
        } catch (error) {
            if (error.message === 'Item bulunamadı') {
                throw new Error('Item bulunamadı');
            }
            throw new Error('Item detayları alınamadı');
        }
    },

    getItemsByGameName: async (gameName) => {
        try {
            
            const items = await loadKnightItems();

            return items.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                    type: item.class || 'Genel',
                    slot_type: item.category,
                    class: item.class || 'Genel',
                    grade: extractGradeFromName(item.name),
                    stats: parseFeatures(item.features),
                    description:
                        item.description === 'NaN'
                            ? ''
                            : item.description || '',
                    image_path: getImagePath(item),
                };
            });
        } catch (error) {
            console.error('getItemsByGameName hatası:', error);
            throw error;
        }
    },

    getItemByGameAndName: async (gameName, itemName) => {
        try {
            
            const items = await itemService.getItemsByGameName(gameName);

            if (items.length === 0) {
                console.error('Item bulunamadı: Oyunda hiç item yok');
                return null;
            }

            // URL'den gelen item adını SEO'ya uygun hale getir
            let searchName = itemName
                .replace(/-/g, ' ')
                .replace(/plus-(\d+)/g, '(+$1)');

            // Tam isim eşlemesi
            const searchNameNormalized = searchName.toLowerCase().trim();

            // item grade değerini kontrol ediyoruz
            const searchGradeMatch = searchName.match(/\(\+(\d+)\)/);
            const searchGrade = searchGradeMatch
                ? parseInt(searchGradeMatch[1])
                : null;

            // grade ve isim tam eşleşme kontrolü yapıyoruz
            if (searchGrade !== null) {
                const gradeItems = items.filter((item) => {
                    const itemGradeMatch = item.name.match(/\(\+(\d+)\)/);
                    const itemGrade = itemGradeMatch
                        ? parseInt(itemGradeMatch[1])
                        : null;
                    return itemGrade === searchGrade;
                });

                if (gradeItems.length > 0) {
                    const searchNameNoGrade = searchNameNormalized
                        .replace(/\s*\(\+\d+\)\s*/g, '')
                        .trim();

                    const scoredItems = gradeItems.map((item) => {
                        const itemNameNoGrade = item.name
                            .toLowerCase()
                            .replace(/\s*\(\+\d+\)\s*/g, '')
                            .trim();
                        let score = 0;

                        if (itemNameNoGrade === searchNameNoGrade) {
                            score = 100;
                        } else if (
                            itemNameNoGrade.includes(searchNameNoGrade)
                        ) {
                            score = 80;
                        } else if (
                            searchNameNoGrade.includes(itemNameNoGrade)
                        ) {
                            score = 60;
                        } else {
                            const searchWords = searchNameNoGrade.split(' ');
                            const itemWords = itemNameNoGrade.split(' ');
                            const commonWords = searchWords.filter((word) =>
                                itemWords.includes(word)
                            );
                            score = commonWords.length * 15;
                        }

                        return { item, score, itemNameNoGrade };
                    });

                    scoredItems.sort((a, b) => b.score - a.score);

                    if (scoredItems.length > 0 && scoredItems[0].score > 0) {
                        const bestMatch = scoredItems[0];

                        const itemDetails = await itemService.getItemById(
                            bestMatch.item.id
                        );

                        return itemDetails;
                    }
                }
            }

            // tam isim eşleşmesi kontrol
            const exactNameMatch = items.find(
                (item) =>
                    item.name.toLowerCase().trim() === searchNameNormalized
            );

            if (exactNameMatch) {
                const itemDetails = await itemService.getItemById(
                    exactNameMatch.id
                );

                return itemDetails;
            }

            //diğer eşleşmeleri kontrol ediyoruz

            let matchCandidates = [];

            items.forEach((item) => {
                const itemNameLower = item.name.toLowerCase().trim();

                const itemGradeMatch = item.name.match(/\(\+(\d+)\)/);
                const itemGrade = itemGradeMatch
                    ? parseInt(itemGradeMatch[1])
                    : null;

                let matchScore = 0;

                if (searchGrade !== null && itemGrade !== null) {
                    if (searchGrade === itemGrade) {
                        matchScore += 50;
                    } else {
                        const gradeDiff = Math.abs(searchGrade - itemGrade);
                        if (gradeDiff <= 5) {
                            matchScore += Math.max(0, 40 - gradeDiff * 8);
                        }
                    }
                }

                if (itemNameLower === searchNameNormalized) {
                    matchScore += 100;
                } else {
                    const itemNameNoGrade = itemNameLower
                        .replace(/\s*\(\+\d+\)\s*/g, '')
                        .trim();
                    const searchNameNoGrade = searchNameNormalized
                        .replace(/\s*\(\+\d+\)\s*/g, '')
                        .trim();

                    if (itemNameNoGrade === searchNameNoGrade) {
                        matchScore += 80;
                    } else if (itemNameNoGrade.includes(searchNameNoGrade)) {
                        matchScore += 60;
                    } else if (searchNameNoGrade.includes(itemNameNoGrade)) {
                        matchScore += 40;
                    } else {
                        const searchWords = searchNameNoGrade.split(' ');
                        const itemWords = itemNameNoGrade.split(' ');
                        const commonWords = searchWords.filter((word) =>
                            itemWords.includes(word)
                        );
                        if (commonWords.length > 0) {
                            matchScore += commonWords.length * 10;

                            const searchWordsPercentage =
                                commonWords.length / searchWords.length;
                            if (searchWordsPercentage >= 0.7) {
                                matchScore += 15;
                            }
                        }
                    }
                }

                if (matchScore > 0) {
                    matchCandidates.push({
                        item,
                        score: matchScore,
                        grade: itemGrade,
                    });
                }
            });

            matchCandidates.sort((a, b) => b.score - a.score);

            const bestMatch =
                matchCandidates.length > 0 ? matchCandidates[0] : null;

            if (bestMatch) {
                const itemDetails = await itemService.getItemById(
                    bestMatch.item.id
                );

                return itemDetails;
            }

            return null;
        } catch (error) {
            console.error('getItemByGameAndName hatası:', error);
            throw error;
        }
    },


};

export { gameService, itemService, imageService };
