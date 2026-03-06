export interface Place {
    name: string;
    desc: string;
    lat: number;
    lng: number;
    category?: 'culture' | 'food' | 'nature' | 'market' | 'history';
}

export interface CityData {
    morning: Place[];
    lunch: Place[];
    evening: Place[];
}

export const CITY_DATA: Record<string, CityData> = {
    'Chennai': {
        morning: [
            { name: "Kapaleeshwarar Temple", desc: "Classic Dravidian architecture in Mylapore", lat: 13.0335, lng: 80.2699, category: 'culture' },
            { name: "Parthasarathy Temple", desc: "8th-century temple in Triplicane", lat: 13.0543, lng: 80.2764, category: 'history' },
            { name: "San Thome Basilica", desc: "Historic church by the sea", lat: 13.0339, lng: 80.2785, category: 'history' }
        ],
        lunch: [
            { name: "Ratna Cafe", desc: "Famous for Sambar Idli in Triplicane", lat: 13.0568, lng: 80.2737, category: 'food' },
            { name: "Murugan Idli Shop", desc: "Authentic South Indian tiffin", lat: 13.0405, lng: 80.2337, category: 'food' },
            { name: "Rayar's Mess", desc: "Hidden gem for home-style food", lat: 13.0330, lng: 80.2690, category: 'food' }
        ],
        evening: [
            { name: "Marina Beach", desc: "World's second longest urban beach", lat: 13.0500, lng: 80.2824, category: 'nature' },
            { name: "Besant Nagar Beach", desc: "Calmer vibe with cafes (Elliot's Beach)", lat: 13.0003, lng: 80.2736, category: 'nature' },
            { name: "Pondy Bazaar", desc: "Bustling shopping hub in T. Nagar", lat: 13.0416, lng: 80.2343, category: 'market' }
        ]
    },
    'Bengaluru': {
        morning: [
            { name: "ISKCON Temple", desc: "Modern spiritual landmark", lat: 13.0094, lng: 77.5505, category: 'culture' },
            { name: "Bull Temple", desc: "Massive monolithic bull in Basavanagudi", lat: 12.9419, lng: 77.5681, category: 'culture' },
            { name: "Bangalore Palace", desc: "Tudor-style architecture and heritage", lat: 12.9988, lng: 77.5921, category: 'history' }
        ],
        lunch: [
            { name: "MTR (Lalbagh)", desc: "Legendary Rava Idli and meals", lat: 12.9554, lng: 77.5855, category: 'food' },
            { name: "Vidyarthi Bhavan", desc: "Historic Masala Dosa spot in Gandhi Bazaar", lat: 12.9455, lng: 77.5724, category: 'food' },
            { name: "CTR", desc: "Famous for Benne Dosa in Malleshwaram", lat: 12.9984, lng: 77.5702, category: 'food' }
        ],
        evening: [
            { name: "Cubbon Park", desc: "The city's green lung", lat: 12.9779, lng: 77.5952, category: 'nature' },
            { name: "Lalbagh Botanical Garden", desc: "Stunning glasshouse and nature", lat: 12.9507, lng: 77.5848, category: 'nature' },
            { name: "Commercial Street", desc: "Iconic shopping destination", lat: 12.9822, lng: 77.6083, category: 'market' }
        ]
    },
    'Hyderabad': {
        morning: [
            { name: "Birla Mandir", desc: "Peaceful white marble temple on a hill", lat: 17.4062, lng: 78.4691, category: 'culture' },
            { name: "Golkonda Fort", desc: "Majestic citadel and acoustic marvel", lat: 17.3833, lng: 78.4011, category: 'history' },
            { name: "Charminar", desc: "Iconic symbol of the city", lat: 17.3616, lng: 78.4747, category: 'history' }
        ],
        lunch: [
            { name: "Paradise Biryani", desc: "World famous Hyderabadi Biryani", lat: 17.4411, lng: 78.4868, category: 'food' },
            { name: "Bawarchi", desc: "Cult favorite for spicy biryani", lat: 17.4062, lng: 78.4984, category: 'food' },
            { name: "Cafe Niloufer", desc: "Iconic for Osmania biscuits and tea", lat: 17.3995, lng: 78.4636, category: 'food' }
        ],
        evening: [
            { name: "Hussain Sagar Lake", desc: "Buddha statue and boating", lat: 17.4239, lng: 78.4738, category: 'nature' },
            { name: "Laad Bazaar", desc: "Famous for bangles and pearls", lat: 17.3610, lng: 78.4730, category: 'market' },
            { name: "Necklace Road", desc: "Scenic drive and chill spots", lat: 17.4262, lng: 78.4754, category: 'nature' }
        ]
    },
    'Kochi': {
        morning: [
            { name: "St. Francis Church", desc: "Oldest European church in India", lat: 9.9672, lng: 76.2415, category: 'history' },
            { name: "Mattancherry Palace", desc: "Dutch palace with stunning murals", lat: 9.9577, lng: 76.2598, category: 'history' },
            { name: "Paradesi Synagogue", desc: "Historic Jewish heritage", lat: 9.9576, lng: 76.2595, category: 'culture' }
        ],
        lunch: [
            { name: "Kashi Art Cafe", desc: "Fusion food in an art gallery", lat: 9.9676, lng: 76.2435, category: 'food' },
            { name: "Dal Roti", desc: "North Indian treats in Fort Kochi", lat: 9.9658, lng: 76.2430, category: 'food' },
            { name: "Oceanos Grille", desc: "Fresh seafood specialties", lat: 9.9573, lng: 76.2393, category: 'food' }
        ],
        evening: [
            { name: "Chinese Fishing Nets", desc: "Iconic sunset view", lat: 9.9712, lng: 76.2427, category: 'nature' },
            { name: "Jew Town", desc: "Antiques and spice shopping", lat: 9.9570, lng: 76.2590, category: 'market' },
            { name: "Marine Drive", desc: "Waterfront promenade", lat: 9.9804, lng: 76.2758, category: 'nature' }
        ]
    },
};

export const generateLocalItinerary = (city: string, days: number, interests: string[]) => {
    const normalizedCity = city.trim();
    const cityKey = Object.keys(CITY_DATA).find(k => k.toLowerCase() === normalizedCity.toLowerCase());
    const data = cityKey ? CITY_DATA[cityKey] : CITY_DATA['Chennai'];

    const categoryMap: Record<string, string> = {
        'Culture': 'culture',
        'History': 'history',
        'Nature': 'nature',
        'Shopping': 'market',
        'Food': 'food'
    };

    const preferredCategories = interests.map(i => categoryMap[i]).filter(Boolean);

    const selectSpots = (pool: Place[], count: number) => {
        const prioritized = pool.filter(p => p.category && preferredCategories.includes(p.category));
        const others = pool.filter(p => !p.category || !preferredCategories.includes(p.category));
        return [...prioritized, ...others].slice(0, count);
    };

    const stops: Place[] = [];
    let text = `# 🌴 Your Personalized ${days}-Day Trip to ${city} (Backup Mode)\n\n`;
    text += `**Theme:** ${interests.join(", ") || "The Best of " + city}\n\n`;

    const morningSpots = selectSpots(data.morning, days + 1);
    const lunchSpots = selectSpots(data.lunch, days + 1);
    const eveningSpots = selectSpots(data.evening, days + 1);

    for (let day = 1; day <= days; day++) {
        const m = morningSpots[day - 1] || data.morning[0];
        const l = lunchSpots[day - 1] || data.lunch[0];
        const e = eveningSpots[day - 1] || data.evening[0];
        stops.push(m, l, e);

        text += `## Day ${day}: ${day === 1 ? 'Starting the Journey' : day === 2 ? 'Deep Dive' : 'Farewell Stroll'}\n\n`;
        text += `### 🌅 Morning: Spiritual & Historic\n`;
        text += `**09:00 AM** - Visit **${m.name}**.\n`;
        text += `${m.desc}.\n\n`;

        text += `### 🍛 Lunch: Authentic Flavors\n`;
        text += `**01:00 PM** - Head to **${l.name}**.\n`;
        text += `${l.desc}.\n\n`;

        text += `### 🌆 Evening: Relax & Explore\n`;
        text += `**05:30 PM** - Wind down at **${e.name}**.\n`;
        text += `${e.desc}.\n\n`;
    }

    text += `\n> **✨ Note:** This is a high-quality backup itinerary generated locally because the AI service is currently taking a nap! Enjoy your trip!`;

    return { itinerary: text, stops, guides: [] };
};
