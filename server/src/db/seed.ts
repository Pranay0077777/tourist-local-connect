import db from './index';
import bcrypt from 'bcryptjs';

const manualGuides = [
    { name: "Priya Raman", avatar: "/uploads/avatars/tamil_nadu_chennai_female_2_priya_1769952720538.png", gender: "females", city: "Chennai" },
    { name: "Rajesh Murthy", avatar: "/uploads/avatars/telangana_hyderabad_male_rajesh_1769953179628.png", gender: "males", city: "Hyderabad" },
    { name: "Amrutha Menon", avatar: "/uploads/avatars/amrutha_menon_kochi.jpg", gender: "females", city: "Kochi" },
    { name: "Vikram Reddy", avatar: "/uploads/avatars/vikram_reddy_bengaluru_1769952126568.png", gender: "males", city: "Bengaluru" },
    { name: "Arjun Kumar", avatar: "/uploads/avatars/arjun_kumar_hyderabad_1769952142020.png", gender: "males", city: "Hyderabad" },
    { name: "Meera Reddy", avatar: "/uploads/avatars/telangana_hyderabad_female_meera_reddy_1769952217602_1769953199300.png", gender: "females", city: "Hyderabad" },
    { name: "Karthik Menon", avatar: "/uploads/avatars/kerala_kochi_male_karthik_menon_1769952701470_1769953258667.png", gender: "males", city: "Kochi" },

    { name: "Aditya Iyer", avatar: "/uploads/avatars/aditya_iyer_bengaluru_1769952159382.png", gender: "males", city: "Bengaluru" },
    { name: "Lakshmi Iyer", avatar: "/uploads/avatars/lakshmi_iyer_hyderabad_1769952176312.png", gender: "females", city: "Hyderabad" },
    { name: "Deepa Krishnan", avatar: "/uploads/avatars/deepa_krishnan_madurai_1769952198656.png", gender: "females", city: "Madurai" },
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
            females: ["/uploads/avatars/tamil_nadu_madurai_female_1_1769952663711.png"]
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

const seed = async () => {
    console.log('🚀 Final Seeding: 5 per STATE, Using AI-Generated Stable Avatars...');
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash('password123', salt);

        console.log('Cleaning existing data...');
        await db.prepare('DELETE FROM messages').run();
        await db.prepare('DELETE FROM bookings').run();
        await db.prepare('DELETE FROM reviews').run();
        await db.prepare('DELETE FROM favorites').run();
        await db.prepare('DELETE FROM guide_availability_slots').run();
        await db.prepare('DELETE FROM posts').run();
        await db.prepare('DELETE FROM saved_itineraries').run();
        await db.prepare('DELETE FROM guides').run();
        await db.prepare('DELETE FROM users').run();

        const allGuides: any[] = [];
        let guideIdCounter = 1;

        for (const [stateName, data] of Object.entries(stateData)) {
            console.log(`Processing state: ${stateName}`);
            let femaleInState = 0;
            let guidesAddedInState = 0;

            for (const [cityIdx, cityName] of data.cities.entries()) {
                let cityQuota = data.cities.length === 1 ? 5 : (cityIdx === 0 ? 3 : 2);
                const cityManual = manualGuides.filter(g => g.city === cityName);
                const cityGuides: any[] = [...cityManual];

                while (cityGuides.length < cityQuota) {
                    const needsFemale = femaleInState < 2 && (5 - guidesAddedInState) <= (2 - femaleInState);
                    const isFemale = needsFemale || (femaleInState < 3 && Math.random() > 0.5);
                    const gender = isFemale ? "females" : "males";

                    const name = data.names[gender][Math.floor(Math.random() * data.names[gender].length)] + " " + data.lastNames[Math.floor(Math.random() * data.lastNames.length)];

                    let avatar = "";
                    if (data.avatars[gender] && data.avatars[gender].length > 0) {
                        avatar = data.avatars[gender].shift();
                    } else {
                        const pool = isFemale ? femaleAvatarFallback : maleAvatarFallback;
                        avatar = pool[Math.floor(Math.random() * pool.length)];
                    }

                    cityGuides.push({ name, avatar, gender });
                    if (isFemale) femaleInState++;
                }

                cityGuides.forEach(g => {
                    const trait = data.traits[Math.floor(Math.random() * data.traits.length)];
                    allGuides.push({
                        id: `guide_${guideIdCounter++}`,
                        name: g.name,
                        avatar: g.avatar,
                        location: `${cityName}, ${stateName}`,
                        languages: JSON.stringify(["English", ...data.languages]),
                        rating: Number((4.6 + (Math.random() * 0.4)).toFixed(1)),
                        review_count: 10 + Math.floor(Math.random() * 50),
                        hourly_rate: 400 + Math.floor(Math.random() * 300),
                        specialties: JSON.stringify([trait, "Local History"]),
                        bio: `Namaste! I'm ${g.name}, an expert guide in ${cityName}. I'm passionate about our local culture and specialize in ${trait.toLowerCase()}.`,
                        verified: 1,
                        response_time: "within 1 hour",
                        experience: `${3 + Math.floor(Math.random() * 10)} years`,
                        completed_tours: 50 + Math.floor(Math.random() * 150),
                        joined_date: "2020-01-01",
                        availability: JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
                    });
                    guidesAddedInState++;
                });
            }
        }

        console.log(`Inserting ${allGuides.length} guides...`);

        const insertUserQuery = 'INSERT INTO users (id, name, email, password, role, avatar, location, bio, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const insertGuideQuery = `
            INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const g of allGuides) {
            await db.prepare(insertUserQuery).run(
                g.id, g.name, `${g.id}@guide.com`, hashedPass, 'guide', g.avatar, g.location, g.bio, g.location.split(',')[0].trim()
            );
            await db.prepare(insertGuideQuery).run(
                g.id, g.name, g.avatar, g.location, g.languages, g.rating, g.review_count, g.hourly_rate, g.specialties,
                g.bio, g.verified, g.response_time, g.experience, g.completed_tours, g.joined_date,
                g.availability, JSON.stringify([]), JSON.stringify([])
            );
        }

        await db.prepare(insertUserQuery).run('tourist_1', 'Test Tourist', 'tourist@test.com', hashedPass, 'tourist', 'https://github.com/shadcn.png', 'Mumbai', 'Travel Enthusiast', 'Mumbai');
        console.log(`✅ Success! Seeded Exactly ${allGuides.length} guides with stable AI avatars.`);
    } catch (err) {
        console.error('❌ SEED ERROR:', err);
        process.exit(1);
    }
};

seed();
