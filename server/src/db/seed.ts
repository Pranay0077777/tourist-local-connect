import db from './index';
import bcrypt from 'bcryptjs';

const manualGuides = [
    { name: "Priya Raman", avatar: "/uploads/avatars/tamil_nadu_chennai_female_2_priya_1769952720538.png", gender: "females", city: "Chennai" },
    { name: "Rajesh Murthy", avatar: "/uploads/avatars/telangana_hyderabad_male_rajesh_1769953179628.png", gender: "males", city: "Hyderabad" },
    { name: "Amrutha Menon", avatar: "/uploads/avatars/amrutha_menon_kochi.jpg", gender: "females", city: "Kochi" },
    { name: "Vikram Reddy", avatar: "/uploads/avatars/vikram_reddy_bengaluru_1769952126568.png", gender: "males", city: "Bengaluru" },
    { name: "Arjun Kumar", avatar: "/uploads/avatars/arjun_kumar_hyderabad_1769952142020.png", gender: "males", city: "Hyderabad" },
    { name: "Meera Reddy", avatar: "/uploads/avatars/telangana_hyderabad_female_meera_reddy_1769952217602_1769953199300.png", gender: "females", city: "Hyderabad" },
    { name: "Karthik Menon", avatar: "/uploads/avatars/karthik_menon_new.png", gender: "males", city: "Kochi" },

    { name: "Aditya Iyer", avatar: "/uploads/avatars/aditya_iyer_bengaluru_1769952159382.png", gender: "males", city: "Bengaluru" },
    { name: "Lakshmi Iyer", avatar: "/uploads/avatars/lakshmi_iyer_hyderabad_1769952176312.png", gender: "females", city: "Hyderabad" },
    { name: "Deepa Krishnan", avatar: "/uploads/avatars/deepa_krishnan_new.png", gender: "females", city: "Madurai" },
    { name: "Suresh Naidu", avatar: "/uploads/avatars/suresh_naidu_hyderabad_1769952217602.png", gender: "males", city: "Hyderabad" },
    { name: "Shanthi Bhat", avatar: "/uploads/avatars/shanthi_bhat_mysuru.jpg", gender: "females", city: "Mysuru" },
    { name: "Sita Reddy", avatar: "/uploads/avatars/sita_reddy_visakhapatnam.jpg", gender: "females", city: "Visakhapatnam" },
    { name: "Vishnu Nair", avatar: "/uploads/avatars/vishnu_nair_kerala.jpg", gender: "males", city: "Thiruvananthapuram" },
    { name: "Srinivasa Raju", avatar: "/uploads/avatars/srinivasa_raju_visakhapatnam.jpg", gender: "males", city: "Visakhapatnam" },
    { name: "Sathish Chowdary", avatar: "/uploads/avatars/sathish_chowdary_visakhapatnam.jpg", gender: "males", city: "Visakhapatnam" },
    { name: "Lakshmi Chowdary", avatar: "/uploads/avatars/lakshmi_chowdary_visakhapatnam.jpg", gender: "females", city: "Visakhapatnam" },
    { name: "Gopi Raju", avatar: "/uploads/avatars/gopi_raju_visakhapatnam.jpg", gender: "males", city: "Visakhapatnam" },
    { name: "Naveen Shetty", avatar: "/uploads/avatars/naveen_shetty_karnataka.jpg", gender: "males", city: "Bengaluru" },
    { name: "Kavitha Nair", avatar: "/uploads/avatars/kavitha_nair_thiruvananthapuram.jpg", gender: "females", city: "Thiruvananthapuram" }
];

const stateData: Record<string, any> = {
    "Tamil Nadu": {
        cities: ["Chennai", "Madurai"],
        names: {
            males: ["Arun", "Senthil", "Siva", "Ramesh", "Prakash"],
            females: ["Deepa", "Anitha", "Sneha", "Sandhya", "Chitra"]
        },
        lastNames: ["Kumar", "S", "Iyer", "Raman", "Vijay"],
        languages: ["Tamil"],
        traits: ["Heritage expert", "Foodie", "Temple guide"],
        avatars: {
            males: ["/uploads/avatars/tamil_nadu_chennai_male_1_1769952644369.png", "/uploads/avatars/tamil_nadu_madurai_male_1_1769952663711_1769953222631.png"],
            females: ["/uploads/avatars/sneha_iyer_new.png", "/uploads/avatars/tamil_nadu_madurai_female_1_1769952663711.png"]
        }
    },
    "Karnataka": {
        cities: ["Bengaluru", "Mysuru"],
        names: {
            males: ["Sanjay", "Vinayaka", "Naveen", "Raghu", "Pradeep"],
            females: ["Rekha", "Shanthi", "Kavya", "Latha", "Roopa"]
        },
        lastNames: ["Gowda", "Shetty", "Rao", "Hegde", "Bhat"],
        languages: ["Kannada"],
        traits: ["Tech-savvy", "Royal historian", "Nature lover"],
        avatars: {
            males: ["/uploads/avatars/karnataka_mysuru_male_1_1769952701470.png", "/uploads/avatars/vinayaka_rao_karnataka_1769952235465.png"],
            females: ["/uploads/avatars/karnataka_bengaluru_female_1_1769952684024.png"]
        }
    },
    "Telangana": {
        cities: ["Hyderabad"],
        names: {
            males: ["Ravi", "Krishna", "Sai", "Pavan", "Venkatesh"],
            females: ["Swapna", "Bhavani", "Himabindu", "Sravani"]
        },
        lastNames: ["Reddy", "Rao", "Naidu", "Goud"],
        languages: ["Telugu"],
        traits: ["Biryani expert", "Fort guide", "Market explorer"],
        avatars: {
            males: ["/uploads/avatars/arjun_kumar_hyderabad_1769952142020.png", "/uploads/avatars/telangana_hyderabad_male_rajesh_1769953179628.png"],
            females: ["/uploads/avatars/telangana_hyderabad_female_meera_reddy_1769952217602_1769953199300.png"]
        }
    },
    "Kerala": {
        cities: ["Kochi", "Thiruvananthapuram"],
        names: {
            males: ["Sreejith", "Rahul", "Manoj", "Ajay", "Vishnu"],
            females: ["Amrutha", "Greeshma", "Reshma", "Dhanya", "Maya"]
        },
        lastNames: ["Nair", "Menon", "Pillai", "Kurian", "Varghese"],
        languages: ["Malayalam"],
        traits: ["Backwater expert", "Traditional arts", "Spice specialist"],
        avatars: {
            males: ["/uploads/avatars/kerala_kochi_male_karthik_menon_1769952701470_1769953258667.png"],
            females: ["/uploads/avatars/kerala_kochi_female_anjali_menon_1769952684024_1769953241110.png"]
        }
    },
    "Andhra Pradesh": {
        cities: ["Visakhapatnam"],
        names: {
            males: ["Ramesh", "Srinivas", "Gopi", "Anil", "Satish"],
            females: ["Lakshmi", "Durga", "Padma", "Sita"]
        },
        lastNames: ["Reddy", "Naidu", "Chowdhury", "Raju"],
        languages: ["Telugu"],
        traits: ["Beach guide", "Temple history", "Seafood expert"],
        avatars: {
            males: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"],
            females: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"]
        }
    }
};

const femaleAvatarFallback = [
    "https://images.unsplash.com/photo-1531123897724-219310809278?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
];

const maleAvatarFallback = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
];

const reviewers = [
    { name: "Rahul S.", avatar: "https://i.pravatar.cc/150?u=rahul", comment: "Amazing experience! Very knowledgeable about the local temples.", tourType: "Heritage Tour" },
    { name: "Anjali M.", avatar: "https://i.pravatar.cc/150?u=anjali", comment: "The food tour was the highlight of our trip. Highly recommend!", tourType: "Food Crawl" },
    { name: "Vikram K.", avatar: "https://i.pravatar.cc/150?u=vikram", comment: "Super friendly and took us to some great hidden gems.", tourType: "City Walk" },
    { name: "Sneha P.", avatar: "https://i.pravatar.cc/150?u=sneha", comment: "Patient and informative. Made our family trip very special.", tourType: "Sightseeing" },
    { name: "David W.", avatar: "https://i.pravatar.cc/150?u=david", comment: "Perfect English and great stories. Best guide in India so far!", tourType: "Photography Tour" },
    { name: "Priya J.", avatar: "https://i.pravatar.cc/150?u=priya", comment: "Very professional and punctual. Great local insights.", tourType: "Market Tour" },
    { name: "Mark T.", avatar: "https://i.pravatar.cc/150?u=mark", comment: "Loved the backwater tour. The guide knew all the best spots.", tourType: "Nature Walk" },
    { name: "Reshma B.", avatar: "https://i.pravatar.cc/150?u=reshma", comment: "Fun and energetic! Felt like exploring with a friend.", tourType: "Night Life" }
];

export const seedData = async () => {
    console.log('🚀 Restoring High-Quality Professional Seeding...');
    try {
        const salt = await bcrypt.genSalt(8);
        const hashedPass = await bcrypt.hash('password123', salt);

        // Check if guides already exist to avoid accidental wipes
        const existingGuides = await db.queryOne('SELECT COUNT(*) as count FROM guides');
        if (existingGuides && Number(existingGuides.count) > 0) {
            console.log('✅ Guides already exist. Skipping seed to protect data.');
            return { success: true, count: Number(existingGuides.count) };
        }

        console.log('Cleaning existing sample data...');
        await db.exec('DELETE FROM messages');
        await db.exec('DELETE FROM bookings');
        await db.exec('DELETE FROM reviews');
        await db.exec('DELETE FROM favorites');
        await db.exec('DELETE FROM guide_availability_slots');
        await db.exec('DELETE FROM posts');
        await db.exec('DELETE FROM saved_itineraries');
        await db.exec('DELETE FROM guides');
        await db.exec('DELETE FROM users');

        // Professional Guide List
        const stableGuides = [
            { id: "g_1", name: "Priya Raman", avatar: "/uploads/avatars/tamil_nadu_chennai_female_2_priya_1769952720538.png", city: "Chennai", state: "Tamil Nadu", bio: "History buff and heritage expert in Chennai." },
            { id: "g_2", name: "Rajesh Kumar", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887", city: "Chennai", state: "Tamil Nadu", bio: "Expert in temple architecture and hidden food spots." },
            { id: "g_3", name: "Amrutha Menon", avatar: "/uploads/avatars/amrutha_menon_kochi.jpg", city: "Kochi", state: "Kerala", bio: "Kochi local with deep knowledge of colonial history." },
            { id: "g_4", name: "Vikram Reddy", avatar: "/uploads/avatars/vikram_reddy_bengaluru_1769952126568.png", city: "Bengaluru", state: "Karnataka", bio: "Tech-savvy guide exploring Bengaluru's royal history." },
            { id: "g_5", name: "Priya Menon", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888", city: "Kochi", state: "Kerala", bio: "Art and culture specialist in Fort Kochi." },
            { id: "g_6", name: "Anjali Menon", avatar: "https://images.unsplash.com/photo-1693649977898-19984f0d231f?w=400&h=400", city: "Thiruvananthapuram", state: "Kerala", bio: "Wellness tourism specialist & certified tour guide." },
            { id: "g_7", name: "Rajesh Murthy", avatar: "/uploads/avatars/telangana_hyderabad_male_rajesh_1769953179628.png", city: "Hyderabad", state: "Telangana", bio: "Hyderabad local passionate about forts and food." },
            { id: "g_8", name: "Meera Reddy", avatar: "/uploads/avatars/telangana_hyderabad_female_meera_reddy_1769952217602_1769953199300.png", city: "Hyderabad", state: "Telangana", bio: "Dedicated to showing the authentic side of Hyderabad." },
            { id: "g_9", name: "Karthik Menon", avatar: "/uploads/avatars/karthik_menon_new.png", city: "Kochi", state: "Kerala", bio: "Houseboat and backwater expert." },
            { id: "g_10", name: "Shanthi Bhat", avatar: "/uploads/avatars/shanthi_bhat_mysuru.jpg", city: "Mysuru", state: "Karnataka", bio: "Royal historian and nature lover in Mysuru." }
        ];

        const insertUserQuery = 'INSERT INTO users (id, name, email, password, role, avatar, location, bio, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const insertGuideQuery = `
            INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertReviewQuery = `
            INSERT INTO reviews (id, guide_id, user_name, user_avatar, rating, comment, date, tour_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const g of stableGuides) {
            const loc = `${g.city}, ${g.state}`;
            await db.exec(insertUserQuery, [
                g.id, g.name, `${g.id}@guide.com`, hashedPass, 'guide', g.avatar, loc, g.bio, g.city
            ]);

            await db.exec(insertGuideQuery, [
                g.id, g.name, g.avatar, loc,
                JSON.stringify(["English", g.state === "Tamil Nadu" ? "Tamil" : g.state === "Kerala" ? "Malayalam" : "Hindi"]),
                4.8, 120, 500,
                JSON.stringify(["Local History", "Culture"]),
                g.bio, 1, "within 1 hour", "5 years", 150, "2023-01-01",
                JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
                JSON.stringify([]), JSON.stringify([])
            ]);

            // Add sample reviews
            for (let i = 0; i < 2; i++) {
                const revId = `rev_${g.id}_${i}`;
                const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
                await db.exec(insertReviewQuery, [
                    revId, g.id, reviewer.name, reviewer.avatar, 5, reviewer.comment, "2024-02-01", reviewer.tourType
                ]);
            }
        }

        // Test User
        await db.exec(insertUserQuery, ['tourist_1', 'Test Tourist', 'tourist@test.com', hashedPass, 'tourist', 'https://github.com/shadcn.png', 'Mumbai', 'Travel Enthusiast', 'Mumbai']);

        console.log(`✅ Success! Restored ${stableGuides.length} professional guides.`);
        return { success: true, count: stableGuides.length };
    } catch (err) {
        console.error('❌ SEED ERROR:', err);
        throw err;
    }
};

if (require.main === module) {
    seedData().catch(() => process.exit(1));
}
