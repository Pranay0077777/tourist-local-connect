import db from './index';
import bcrypt from 'bcryptjs';

const manualGuides = [
    { name: "Priya Raman", avatar: "https://images.unsplash.com/photo-1679335067355-40223d903144?w=200&h=200&fit=crop", gender: "females", city: "Chennai" },
    { name: "Rajesh Murthy", avatar: "https://images.unsplash.com/photo-1681141190048-b3f4b9ab3b5a?w=200&h=200&fit=crop", gender: "males", city: "Hyderabad" },
    { name: "Anjali Menon", avatar: "https://images.unsplash.com/photo-1693649977898-19984f0d231f?w=200&h=200&fit=crop", gender: "females", city: "Kochi" },
    { name: "Vikram Reddy", avatar: "https://media.istockphoto.com/id/1322664345/photo/young-indian-businessman-with-his-freight-forward-lorry-or-truck.jpg?s=1024x1024&w=400&h=400&fit=crop", gender: "males", city: "Bengaluru" },
    { name: "Arjun Kumar", avatar: "https://media.istockphoto.com/id/1394069878/photo/man-vlogging-on-the-beach.jpg?s=612x612&w=400&h=400&fit=crop", gender: "males", city: "Hyderabad" },
    { name: "Meera Reddy", avatar: "https://images.unsplash.com/photo-1735845929510-48e0ecdb53d2?w=200&h=200&fit=crop", gender: "females", city: "Hyderabad" },
    { name: "Karthik Menon", avatar: "https://plus.unsplash.com/premium_photo-1682092829937-bb5b289be2c3?w=400&h=400&fit=crop", gender: "males", city: "Kochi" },
    { name: "Kavita Nair", avatar: "https://images.unsplash.com/photo-1652953233042-35a88a3e3388?w=200&h=200&fit=crop", gender: "females", city: "Thiruvananthapuram" },
    { name: "Aditya Iyer", avatar: "https://media.istockphoto.com/id/1284080305/photo/driver-in-uniform-entering-the-bus.jpg?s=612x612&w=400&h=400&fit=crop", gender: "males", city: "Bengaluru" },
    { name: "Lakshmi Iyer", avatar: "https://media.istockphoto.com/id/1254176393/photo/portrait-of-a-happy-woman-of-indian-ethnicity.jpg?s=612x612&w=400&h=400&fit=crop", gender: "females", city: "Hyderabad" },
    { name: "Deepa Krishnan", avatar: "https://media.istockphoto.com/id/1313502972/photo/portrait-of-beautiful-woman-having-fun.jpg?s=612x612&w=400&h=400&fit=crop", gender: "females", city: "Madurai" },
    { name: "Suresh Naidu", avatar: "https://media.istockphoto.com/id/1398271493/photo/college-student-with-book-and-backpack-outdoor.jpg?s=612x612&w=400&h=400&fit=crop", gender: "males", city: "Hyderabad" }
];

const stateData: Record<string, any> = {
    "Tamil Nadu": {
        cities: ["Chennai", "Madurai"],
        names: {
            males: ["Arun", "Senthil", "Siva", "Ramesh", "Prakash", "Mani", "Selvam", "Aditya", "Rohan", "Siddharth"],
            females: ["Deepa", "Anitha", "Sneha", "Sandhya", "Chitra", "Rekha", "Shalini", "Nandini"]
        },
        lastNames: ["Kumar", "S", "Iyer", "Raman", "Vijay", "Mani", "Pillai"],
        languages: ["Tamil"],
        traits: ["Heritage expert", "Foodie", "Temple guide"]
    },
    "Karnataka": {
        cities: ["Bengaluru", "Mysuru"],
        names: {
            males: ["Sanjay", "Vinayaka", "Naveen", "Raghu", "Pradeep", "Manjunath", "Srinivas", "Kiran"],
            females: ["Rekha", "Shanthi", "Kavya", "Latha", "Roopa", "Jyothi", "Ambika", "Preeti"]
        },
        lastNames: ["Gowda", "Shetty", "Rao", "Hegde", "Bhat", "Patil"],
        languages: ["Kannada"],
        traits: ["Tech-savvy", "Royal historian", "Nature lover"]
    },
    "Telangana": {
        cities: ["Hyderabad"], // Only Hyderabad to satisfy the 5-guides-in-Hyderabad request
        names: {
            males: ["Ravi", "Krishna", "Sai", "Pavan", "Venkatesh"],
            females: ["Swapna", "Bhavani", "Himabindu", "Sravani"]
        },
        lastNames: ["Reddy", "Rao", "Naidu", "Goud"],
        languages: ["Telugu"],
        traits: ["Biryani expert", "Fort guide", "Market explorer"]
    },
    "Kerala": {
        cities: ["Kochi", "Thiruvananthapuram"],
        names: {
            males: ["Sreejith", "Rahul", "Manoj", "Ajay", "Vishnu", "Hari"],
            females: ["Amrutha", "Greeshma", "Reshma", "Dhanya", "Maya", "Lekshmi"]
        },
        lastNames: ["Nair", "Menon", "Pillai", "Kurian", "Varghese"],
        languages: ["Malayalam"],
        traits: ["Backwater expert", "Traditional arts", "Spice specialist"]
    },
    "Andhra Pradesh": {
        cities: ["Visakhapatnam"],
        names: {
            males: ["Ramesh", "Srinivas", "Gopi", "Anil", "Satish"],
            females: ["Lakshmi", "Durga", "Padma", "Sita"]
        },
        lastNames: ["Reddy", "Naidu", "Chowdhury", "Raju"],
        languages: ["Telugu"],
        traits: ["Beach guide", "Temple history", "Seafood expert"]
    }
};

const femaleAvatarPool = [
    "1573497019940-1c28c88b4f3e", "1589130482000-bc61f08248a7", "1607503814060-f24b59740076", "1635488662761-dbf26019a55a",
    "1494790108377-be9c29b29330", "1531123897724-219310809278"
];

const maleAvatarPool = [
    "1539571696357-5a69c17a67c6", "1507003211169-0a1dd7228f2d", "1520341202344-475b97180732", "1463453091185-61582044d556",
    "1500648767791-00dcc994a43e", "1519085138458-252c8a69650b"
];

const seed = async () => {
    console.log('🚀 Final Seeding: 5 per STATE, Using 12 Manual Guides...');
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
                // Determine guides for this city (3/2 split if 2 cities, else 5)
                let cityQuota = data.cities.length === 1 ? 5 : (cityIdx === 0 ? 3 : 2);

                // Get manual guides for this city
                const cityManual = manualGuides.filter(g => g.city === cityName);
                const cityGuides: any[] = [...cityManual];

                // Fill remaining quota with generic
                while (cityGuides.length < cityQuota) {
                    const needsFemale = femaleInState < 2 && (5 - guidesAddedInState) <= (2 - femaleInState);
                    const isFemale = needsFemale || (femaleInState < 3 && Math.random() > 0.5);
                    const gender = isFemale ? "females" : "males";

                    const name = data.names[gender][Math.floor(Math.random() * data.names[gender].length)] + " " + data.lastNames[Math.floor(Math.random() * data.lastNames.length)];
                    const pool = isFemale ? femaleAvatarPool : maleAvatarPool;
                    const avatarId = pool[Math.floor(Math.random() * pool.length)];

                    cityGuides.push({
                        name,
                        avatar: `https://images.unsplash.com/photo-${avatarId}?w=400&h=400&fit=crop`,
                        gender
                    });

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
                        joined_date: "2022-01-01",
                        availability: JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
                    });
                    guidesAddedInState++;
                });
            }
        }

        console.log(`Inserting ${allGuides.length} guides into database...`);

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
                g.availability, "[]", "[]"
            );
        }

        await db.prepare(insertUserQuery).run('tourist_1', 'Test Tourist', 'tourist@test.com', hashedPass, 'tourist', 'https://github.com/shadcn.png', 'Mumbai', 'Travel Enthusiast', 'Mumbai');

        console.log(`✅ Success! Seeded Exactly ${allGuides.length} guides (5 per state).`);
    } catch (err) {
        console.error('❌ SEED ERROR:', err);
        process.exit(1);
    }
};

seed();
