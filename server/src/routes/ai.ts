import express from 'express';
import db from '../db';
import { planTripWithAI } from '../services/aiService';

const router = express.Router();

interface Place {
    name: string;
    desc: string;
    lat: number;
    lng: number;
    category?: 'culture' | 'food' | 'nature' | 'market' | 'history';
}

interface CityData {
    morning: Place[];
    lunch: Place[];
    evening: Place[];
}

// Knowledge Base for South Indian Cities with Coordinates and Categories
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
    'Mysuru': {
        morning: [
            { name: "Chamundeshwari Temple", desc: "Hilltop temple with views", lat: 12.2753, lng: 76.6702, category: 'culture' },
            { name: "Jaganmohan Palace", desc: "Art gallery and royal history", lat: 12.3060, lng: 76.6500, category: 'history' },
            { name: "Mysore Palace", desc: "Royal residence (Morning visit)", lat: 12.3051, lng: 76.6551, category: 'history' }
        ],
        lunch: [
            { name: "Hotel Mylari", desc: "Famous for soft Mylari Dosas", lat: 12.3117, lng: 76.6548, category: 'food' },
            { name: "RRR", desc: "Spicy Andhra-style non-veg meals", lat: 12.3106, lng: 76.6528, category: 'food' },
            { name: "Vinayaka Mylari", desc: "Traditional breakfast/lunch", lat: 12.3117, lng: 76.6548, category: 'food' }
        ],
        evening: [
            { name: "Brindavan Gardens", desc: "Musical fountain show", lat: 12.4218, lng: 76.5721, category: 'nature' },
            { name: "Devaraja Market", desc: "Bustling local heritage market", lat: 12.3130, lng: 76.6515, category: 'market' },
            { name: "Karanji Lake", desc: "Nature park and boating", lat: 12.3040, lng: 76.6743, category: 'nature' }
        ]
    },
    'Madurai': {
        morning: [
            { name: "Meenakshi Amman Temple", desc: "The spiritual heart of Madurai", lat: 9.9195, lng: 78.1193, category: 'culture' },
            { name: "Koodal Azhagar Temple", desc: "Ancient Vishnu temple", lat: 9.9157, lng: 78.1157, category: 'culture' },
            { name: "Gandhi Memorial Museum", desc: "Historic tranquility", lat: 9.9333, lng: 78.1360, category: 'history' }
        ],
        lunch: [
            { name: "Murugan Idli Shop", desc: "Sample the city's fluffiest idlis", lat: 9.9202, lng: 78.1147, category: 'food' },
            { name: "Amma Mess", desc: "Famous for non-veg delicacies", lat: 9.9327, lng: 78.1408, category: 'food' },
            { name: "Kumar Mess", desc: "Authentic local flavors", lat: 9.9272, lng: 78.1328, category: 'food' }
        ],
        evening: [
            { name: "Thirumalai Nayakkar Mahal", desc: "Sound & Light show in palace", lat: 9.9153, lng: 78.1235, category: 'history' },
            { name: "Puthu Mandapam", desc: "Traditional market near temple", lat: 9.9190, lng: 78.1210, category: 'market' },
            { name: "Vandiyur Mariamman Teppakulam", desc: "Massive temple tank", lat: 9.9079, lng: 78.1508, category: 'culture' }
        ]
    },
    'Pondicherry': {
        morning: [
            { name: "Manakula Vinayagar Temple", desc: "Famous Ganesh temple", lat: 11.9366, lng: 79.8329, category: 'culture' },
            { name: "Sri Aurobindo Ashram", desc: "Place of silence and peace", lat: 11.9368, lng: 79.8341, category: 'history' },
            { name: "Auroville Matrimandir", desc: "Architectural and spiritual core", lat: 12.0068, lng: 79.8105, category: 'culture' }
        ],
        lunch: [
            { name: "Cafe des Arts", desc: "French colonial vibe", lat: 11.9327, lng: 79.8336, category: 'food' },
            { name: "Surguru", desc: "Classic South Indian vegetarian", lat: 11.9348, lng: 79.8299, category: 'food' },
            { name: "Tanto Pizzeria", desc: "Auroville style wood-fired pizza", lat: 11.9961, lng: 79.8260, category: 'food' }
        ],
        evening: [
            { name: "Promenade Beach", desc: "No vehicles in evening, perfect walk", lat: 11.9330, lng: 79.8361, category: 'nature' },
            { name: "White Town Walks", desc: "Explore the French architecture", lat: 11.9335, lng: 79.8340, category: 'history' },
            { name: "Goubert Market", desc: "Local fish and vegetable market", lat: 11.9380, lng: 79.8300, category: 'market' }
        ]
    },
    'Coimbatore': {
        morning: [
            { name: "Marudhamalai Temple", desc: "Hilltop Murugan temple", lat: 11.0458, lng: 76.8522, category: 'culture' },
            { name: "Gass Forest Museum", desc: "Historic natural history museum", lat: 11.0117, lng: 76.9482, category: 'history' },
            { name: "Adiyogi Shiva Statue", desc: "Massive scenic statue", lat: 10.9723, lng: 76.7403, category: 'culture' }
        ],
        lunch: [
            { name: "Annapoorna", desc: "The standard for Sambar Idli", lat: 11.0089, lng: 76.9616, category: 'food' },
            { name: "Hari Bhavanam", desc: "Authentic Kongu Nadu cuisine", lat: 11.0068, lng: 76.9740, category: 'food' },
            { name: "Junior Kuppanna", desc: "Spicy non-veg feasts", lat: 11.0063, lng: 76.9634, category: 'food' }
        ],
        evening: [
            { name: "Valankulam Lake", desc: "Sunset and walking track", lat: 10.9930, lng: 76.9616, category: 'nature' },
            { name: "Race Course Road", desc: "Premium walking area", lat: 11.0041, lng: 76.9743, category: 'nature' },
            { name: "Brookefields Mall", desc: "Popular shopping and chill spot", lat: 11.0076, lng: 76.9610, category: 'market' }
        ]
    },
    'Thiruvananthapuram': {
        morning: [
            { name: "Padmanabhaswamy Temple", desc: "The richest temple", lat: 8.4831, lng: 76.9436, category: 'culture' },
            { name: "Kuthiramalika Palace", desc: "Traditional Kerala architecture", lat: 8.4811, lng: 76.9458, category: 'history' },
            { name: "Napier Museum", desc: "Indo-Saracenic art", lat: 8.5085, lng: 76.9554, category: 'history' }
        ],
        lunch: [
            { name: "Mothers Veg Plaza", desc: "Authentic Kerala Sadya", lat: 8.5037, lng: 76.9497, category: 'food' },
            { name: "Zam Zam", desc: "Arabian delights", lat: 8.5028, lng: 76.9502, category: 'food' },
            { name: "Villa Maya", desc: "Fine dining in heritage setting", lat: 8.4883, lng: 76.9405, category: 'food' }
        ],
        evening: [
            { name: "Shangumugham Beach", desc: "Sunset and sculpture", lat: 8.4795, lng: 76.9111, category: 'nature' },
            { name: "Kovalam Beach", desc: "Lighthouse and waves", lat: 8.3988, lng: 76.9820, category: 'nature' },
            { name: "Connemara Market", desc: "Oldest market in Trivandrum", lat: 8.5010, lng: 76.9500, category: 'market' }
        ]
    },
    'Visakhapatnam': {
        morning: [
            { name: "Simhachalam Temple", desc: "Hilltop Narasimha temple", lat: 17.7663, lng: 83.2505, category: 'culture' },
            { name: "Kailasagiri", desc: "Shiva statue with sea view", lat: 17.7478, lng: 83.3444, category: 'nature' },
            { name: "Submarine Museum", desc: "Unique historical experience", lat: 17.7174, lng: 83.3308, category: 'history' }
        ],
        lunch: [
            { name: "Venkatadri Vantillu", desc: "Local favorite vegetarian", lat: 17.7295, lng: 83.3087, category: 'food' },
            { name: "Dharani (Dasapalla)", desc: "Andhra meals", lat: 17.7118, lng: 83.3005, category: 'food' },
            { name: "Sea Inn (Raju Gaari Dhaba)", desc: "Spicy seafood by the beach", lat: 17.7432, lng: 83.3510, category: 'food' }
        ],
        evening: [
            { name: "RK Beach", desc: "The city's main hangout", lat: 17.7145, lng: 83.3235, category: 'nature' },
            { name: "Rushikonda Beach", desc: "Cleaner waters and sports", lat: 17.7818, lng: 83.3853, category: 'nature' },
            { name: "Jagadamba Junction", desc: "Bustling shopping area", lat: 17.7118, lng: 83.3014, category: 'market' }
        ]
    }
};

const getItineraryTemplate = (city: string, days: number, interests: string[]) => {
    // Case-insensitive lookup
    const normalizedCity = city.trim();
    const cityKey = Object.keys(CITY_DATA).find(k => k.toLowerCase() === normalizedCity.toLowerCase());
    const data = cityKey ? CITY_DATA[cityKey] : CITY_DATA['Chennai']; // Fallback to Chennai

    // Interest mapping to categories
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
    let text = `# 🌴 Your Personalized ${days}-Day Trip to ${city}\n\n`;
    text += `**Theme:** ${interests.join(", ") || "The Best of " + city}\n\n`;

    const morningSpots = selectSpots(data.morning, days + 1);
    const lunchSpots = selectSpots(data.lunch, days + 1);
    const eveningSpots = selectSpots(data.evening, days + 1);

    // Day 1
    const d1m = morningSpots[0] || data.morning[0];
    const d1l = lunchSpots[0] || data.lunch[0];
    const d1e = eveningSpots[0] || data.evening[0];
    stops.push(d1m, d1l, d1e);

    text += `## Day 1: The Heart of ${city}\n\n`;
    text += `### 🌅 Morning: Spiritual & Historic Start\n`;
    text += `**09:00 AM** - Visit **${d1m.name}**.\n`;
    text += `${d1m.desc}. It's the perfect way to soak in the local vibe and admire the architecture.\n\n`;

    text += `### 🍛 Lunch: Authentic Flavors\n`;
    text += `**01:00 PM** - Head to **${d1l.name}**.\n`;
    text += `${d1l.desc}. A must-try culinary experience for anyone visiting ${city}.\n\n`;

    text += `### 🌆 Evening: Relax & Explore\n`;
    text += `**05:30 PM** - Wind down at **${d1e.name}**.\n`;
    text += `${d1e.desc}. Enjoy the sunset or the evening buzz of the city.\n\n`;
    text += `> 💡 **Pro Tip:** Wear comfortable shoes as there's plenty of walking today!\n\n`;

    if (days > 1) {
        const d2m = morningSpots[1] || data.morning[1];
        const d2l = lunchSpots[1] || data.lunch[1];
        const d2e = eveningSpots[1] || data.evening[1];
        stops.push(d2m, d2l, d2e);

        text += `## Day 2: Deep Dive into Culture\n\n`;
        text += `### 📸 Morning: Scenic Views\n`;
        text += `**08:30 AM** - Early visit to **${d2m.name}**.\n`;
        text += `${d2m.desc}. It's quieter in the morning and offers great photo opportunities.\n\n`;

        text += `### 🥗 Lunch: Local Delicacies\n`;
        text += `**01:00 PM** - Try the famous dishes at **${d2l.name}**.\n`;
        text += `${d2l.desc}. Don't forget to ask for the daily special!\n\n`;

        text += `### 🛍️ Evening: Market Vibes\n`;
        text += `**06:00 PM** - Experience the atmosphere at **${d2e.name}**.\n`;
        text += `${d2e.desc}. Perfect for ${interests.includes('Shopping') ? 'picking up souvenirs' : 'people watching'}.\n\n`;
    }

    if (days > 2) {
        const d3m = data.morning[2] || data.morning[0];
        const d3l = lunchSpots[2] || data.lunch[2];
        const d3e = eveningSpots[2] || data.evening[2];
        stops.push(d3m, d3l, d3e);

        text += `## Day 3: Hidden Gems & Leisure\n\n`;
        text += `### 🌿 Morning: Nature & Peace\n`;
        text += `**09:30 AM** - Take it easy with a visit to **${d3m.name}**.\n`;
        text += `A serene spot to reflect on your trip.\n\n`;

        text += `### 🍽️ Lunch: Final Feast\n`;
        text += `**01:30 PM** - A final feast at **${d3l.name}**.\n`;
        text += `Savor the last bites of ${city}'s incredible cuisine.\n\n`;

        text += `### ✨ Evening: Farewell Sunset\n`;
        text += `**05:30 PM** - One last stroll at **${d3e.name}**.\n`;
        text += `Say goodbye to the city with a beautiful view.\n\n`;
    }

    let tips = "\n> **✨ AI Pro Tips:**\n";
    if (interests.includes('Food')) tips += "> - Madurai and Hyderabad have incredible street food; look for small stalls near the main temples/forts.\n";
    if (interests.includes('History')) tips += "> - Most heritage sites open early (around 6 or 7 AM). Going early helps you beat the heat and the crowds.\n";
    if (interests.includes('Nature')) tips += "> - Don't forget sunscreen and a hat, especially for the beach/lake visits in the evening.\n";

    tips += "> - **Pro Tip:** Book a local guide through our dashboard to hear the secret stories behind these landmarks!";
    text += tips;

    return { text, stops };
};

router.post('/plan-trip', async (req, res) => {
    try {
        const { city, days, interests } = req.body;

        if (!city || typeof city !== 'string') {
            return res.status(400).json({ error: "City is required and must be a string." });
        }

        let itineraryText = "";
        let finalStops = [];

        const aiItinerary = await planTripWithAI(city, days || 1, interests || []);

        if (aiItinerary) {
            itineraryText = aiItinerary;
            const { stops } = getItineraryTemplate(city, days || 1, interests || []);
            finalStops = stops;
        } else {
            const { text, stops } = getItineraryTemplate(city, days || 1, interests || []);
            itineraryText = text;
            finalStops = stops;
        }

        const allGuides = await db.query(`SELECT * FROM guides WHERE LOWER(location) LIKE LOWER(?)`, [`%${city}%`]);

        const scoredGuides = allGuides.map(guide => {
            let score = 0;
            const specs = typeof guide.specialties === 'string' ? JSON.parse(guide.specialties || '[]') : guide.specialties;
            interests.forEach((interest: string) => {
                if (specs.some((s: string) => s.toLowerCase().includes(interest.toLowerCase()))) {
                    score += 1;
                }
            });
            return {
                id: guide.id,
                name: guide.name,
                avatar: guide.avatar,
                location: guide.location,
                languages: typeof guide.languages === 'string' ? JSON.parse(guide.languages || '[]') : guide.languages,
                rating: guide.rating,
                reviewCount: guide.review_count,
                hourlyRate: guide.hourly_rate,
                specialties: specs,
                bio: guide.bio,
                verified: !!guide.verified,
                experience: guide.experience,
                score
            };
        }).sort((a, b) => b.score - a.score);

        res.json({
            itinerary: itineraryText,
            stops: finalStops,
            guides: scoredGuides.slice(0, 6).map(({ score, ...g }) => g)
        });
    } catch (error: any) {
        console.error("AI Planner Error:", error);
        res.status(500).json({
            error: error.message || 'Failed to generate plan',
            details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
});

export default router;
