import db from './index';
import bcrypt from 'bcryptjs';

// Refined Mock Data Pools with Cultural Matching
const stateData: Record<string, any> = {
    "Tamil Nadu": {
        cities: ["Chennai", "Madurai"],
        names: {
            men: ["Arun", "Senthil", "Karthik", "Siva", "Vikram", "Ramesh", "Prakash", "Mani", "Selvam", "Aditya", "Rohan", "Siddharth", "Vijay", "Anbu", "Baskar"],
            women: ["Deepa", "Meera", "Lakshmi", "Anitha", "Sneha", "Kavitha", "Sandhya", "Chitra", "Rekha", "Shalini", "Nandini", "Divya", "Priya", "Maya", "Revathy"]
        },
        lastNames: ["Kumar", "S", "Iyer", "Raman", "Vijay", "Mani", "Nair", "Pillai", "Reddy", "Naidu", "Subramanian", "Chettiar"],
        languages: ["Tamil"],
        traits: ["Heritage expert", "Foodie", "Temple guide"]
    },
    "Karnataka": {
        cities: ["Bengaluru", "Mysuru"],
        names: {
            men: ["Sanjay", "Vinayaka", "Naveen", "Raghu", "Pradeep", "Manjunath", "Srinivas", "Kiran", "Basavaraj", "Darshan", "Puneeth", "Yash"],
            women: ["Rekha", "Shanthi", "Kavya", "Latha", "Roopa", "Jyothi", "Ambika", "Preeti", "Rashmi", "Shruti", "Deepika"]
        },
        lastNames: ["Gowda", "Shetty", "Rao", "Hegde", "Bhat", "Patil", "Reddy", "Kulkarni"],
        languages: ["Kannada"],
        traits: ["Tech-savvy", "Royal historian", "Nature lover"]
    },
    "Telangana": {
        cities: ["Hyderabad", "Warangal"],
        names: {
            men: ["Ravi", "Krishna", "Sai", "Pavan", "Venkatesh", "Chandra", "Mohan", "Pranay", "Karthik", "Sandeep", "Mahesh", "Nikhil"],
            women: ["Swapna", "Bhavani", "Himabindu", "Sirisha", "Anusha", "Sravani", "Pranavi", "Harini", "Keerthi", "Srithi"]
        },
        lastNames: ["Reddy", "Rao", "Naidu", "Dandu", "Goud", "Varma", "Yadav", "Chary"],
        languages: ["Telugu"],
        traits: ["Biryani expert", "Fort guide", "Market explorer"]
    },
    "Kerala": {
        cities: ["Kochi", "Thiruvananthapuram"],
        names: {
            men: ["Sreejith", "Rahul", "Manoj", "Ajay", "Vishnu", "Hari", "Pranav", "Joyal", "Abhilash", "Suresh", "Ranjith"],
            women: ["Amrutha", "Anjali", "Greeshma", "Reshma", "Dhanya", "Maya", "Lekshmi", "Aswathy", "Nimmy", "Sruthi"]
        },
        lastNames: ["Nair", "Menon", "Pillai", "Kurian", "Varghese", "Mathew", "Thomas", "George"],
        languages: ["Malayalam"],
        traits: ["Backwater expert", "Traditional arts", "Spice specialist"]
    },
    "Andhra Pradesh": {
        cities: ["Visakhapatnam"],
        names: {
            men: ["Ramesh", "Srinivas", "Gopi", "Anil", "Satish", "Lokesh", "Kalyan", "Chaitanya"],
            women: ["Lakshmi", "Durga", "Padma", "Sita", "Radha", "Vani", "Sneha", "Anila"]
        },
        lastNames: ["Reddy", "Naidu", "Chowdhury", "Raju", "Prasad", "Sastry"],
        languages: ["Telugu"],
        traits: ["Beach guide", "Temple history", "Seafood expert"]
    }
};

const femaleAvatarPool = [
    "1594744803329-a3141467f3b3", // Priya
    "1610030469983-98e550d6193c", // Amrutha
    "1573497019940-1c28c88b4f3e",
    "1589130482000-bc61f08248a7",
    "1607503814060-f24b59740076",
    "1635488662761-dbf26019a55a",
    "1494790108377-be9c29b29330",
    "1531123897724-219310809278",
    "1567532939103-c053bb14b2b9",
    "1621184455862-c163dfb30e0f",
    "1587614385392-f010682b71fa",
    "1534575180483-2646a2f8dc4c",
    "1529626431928-854371892706",
    "1503107228863-7e449297f6c6",
    "1488423191180-8a1fe5d1297e",
    "1524250233718-f283d605305b",
    "1524502399407-a6c803c5f566",
    "1514620023150-f1920ee4274c",
    "1544006659-1051df3f82de",
    "1611432579177-eb49d37536d7",
    "1604004541739-eb44d2840ac2",
    "1581333123697-03ca68a1f44d",
    "1612459284203-d62153b9242d",
    "1598553506441-2b1f8664654c",
    "1631214500175-5f9037803612",
    "1607990281512-70b9995f3125",
    "1600271772421-c5f4ee71444d",
    "1610271340732-2ef1239856cf",
    "1623944889617-66e6877054f2",
    "1613149025984-7a2d989808df",
    "1614273365306-df129277d7ff",
    "1614611374047-92111d77ae33",
    "1615412721415-467272717a6a",
    "1615813799719-7d05001e3a4f",
    "1616422285663-abe3bb08427e",
    "1616747402095-23c21a1158f9",
    "1617267156947-074945d81db2",
    "1617865201416-56c2763328e7",
    "1618331835738-2e55253eb491",
    "1618844530364-79361a49911e",
    "1619335601271-e941f0293ebc",
    "1619865251502-39bd92843d1a",
    "1620365287631-01f78631ed3e",
    "1620865401347-810e9641ea63",
    "1621251300057-0bc8765c3efc",
    "1621684410070-9842f6f57c81",
    "1622115163116-2911ad000523",
    "1622615412702-861c8f1847e0",
    "1623065251412-25bd57e4e062"
];

const maleAvatarPool = [
    "1539571696357-5a69c17a67c6",
    "1506794778202-cad84cf45f1d", // Rajesh
    "1566753323558-f4e0952af115", // Sanjay
    "1507003211169-0a1dd7228f2d",
    "1520341202344-475b97180732",
    "1463453091185-61582044d556",
    "1500648767791-00dcc994a43e",
    "1519085138458-252c8a69650b",
    "1531427186644-64b23c2d4761",
    "1552374196-a9d3a4362812",
    "1534033675-802c65f0b5d5",
    "1522522327124-ed993eb0fc10",
    "1503443203922-0a9197356b44",
    "1530268329868-3bb2c49783bb",
    "1521117664038-d85149712d44",
    "1529068755536-a93a02175a50",
    "1537512140618-25941da74b0c",
    "1530629013233-7243c6838883",
    "1530510342266-410a3c289831",
    "1504257404375-707b6670868a",
    "1522075469751-3a6694fb2f61",
    "1480455624387-4d6cb6064124",
    "1484517548383-e94513df5e6e",
    "1548142854-f974b7f96dad",
    "1512485694744-12d020d7baed",
    "1515202983187-2410369a21d1",
    "1516222332222-22df7015cf11",
    "1517404209146-2415112341b1",
    "1518331699397-40da45c60e04",
    "1519345185114-18d3d09a2b65",
    "1520612147041-e3f156891912",
    "1521119232120-18dec394012c",
    "1521517410648-242bc02e23f1",
    "1522066625181-a06830500bf0",
    "1522522327124-ed993eb0fc10",
    "1523062366112-70678d91ec4d",
    "1523522353112-2591e6b91122",
    "1524065251412-25d25e1a1155"
];

const featuredGuides = [
    {
        id: "p_raman",
        name: "Priya Raman",
        avatar: "https://images.unsplash.com/photo-1594744803329-a3141467f3b3?q=80&w=400&h=400&fit=crop",
        location: "Chennai, Tamil Nadu",
        languages: JSON.stringify(["Tamil", "English", "Hindi"]),
        rating: 4.9,
        review_count: 245,
        hourly_rate: 700,
        specialties: JSON.stringify(["Heritage Walks", "Classical Dance Tours"]),
        bio: "Namaste! I'm Priya Raman, a 32-year-old certified heritage guide. I bring the stories of Tamil history and classical arts to life through my curated walks in Chennai.",
        verified: 1,
        response_time: "under 15 mins",
        experience: "8 years",
        completed_tours: 520,
        joined_date: "2021-03-12"
    },
    {
        id: "r_kumar",
        name: "Rajesh Kumar",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&fit=crop",
        location: "Chennai, Tamil Nadu",
        languages: JSON.stringify(["Tamil", "English", "Telugu"]),
        rating: 4.8,
        review_count: 180,
        hourly_rate: 600,
        specialties: JSON.stringify(["Street Food", "Market Explorer"]),
        bio: "Hey there! I'm Rajesh, your local foodie guide. If you want the best biryani or the secret filter coffee spots in Chennai, I'm your man!",
        verified: 1,
        response_time: "under 30 mins",
        experience: "10 years",
        completed_tours: 680,
        joined_date: "2020-05-20"
    },
    {
        id: "a_nair",
        name: "Amrutha Nair",
        avatar: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&h=400&fit=crop",
        location: "Kochi, Kerala",
        languages: JSON.stringify(["Malayalam", "English", "Hindi"]),
        rating: 4.9,
        review_count: 124,
        hourly_rate: 650,
        specialties: JSON.stringify(["Backwater Tours", "Kathakali Art"]),
        bio: "Namaste! I am Amrutha, a 28-year-old guide from Kochi. I preserve our cultural essence through traditional tours, usually wearing our Kerala saree to celebrate our heritage.",
        verified: 1,
        response_time: "within 30 mins",
        experience: "6 years",
        completed_tours: 410,
        joined_date: "2022-05-10"
    },
    {
        id: "s_gowda",
        name: "Sanjay Gowda",
        avatar: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=400&h=400&fit=crop",
        location: "Bengaluru, Karnataka",
        languages: JSON.stringify(["Kannada", "English", "Telugu"]),
        rating: 4.8,
        review_count: 95,
        hourly_rate: 550,
        specialties: JSON.stringify(["Tech Hub", "Heritage Parks"]),
        bio: "Hello! I'm Sanjay, a 34-year-old guide in Bengaluru. I blend the city's tech-forward identity with its deep-rooted history.",
        verified: 1,
        response_time: "within 1 hour",
        experience: "5 years",
        completed_tours: 310,
        joined_date: "2023-01-15"
    },
    {
        id: "reka_bhat",
        name: "Reka Bhat",
        avatar: "https://images.unsplash.com/photo-1644134394649-5a2c95d206b4?q=80&w=400&h=400&fit=crop",
        location: "Mysuru, Karnataka",
        languages: JSON.stringify(["Kannada", "English", "Hindi"]),
        rating: 4.9,
        review_count: 82,
        hourly_rate: 580,
        specialties: JSON.stringify(["Royal Heritage", "Mysuru Palace Tours", "Silk & Sandalwood Tours"]),
        bio: "Namaste! I'm Reka Bhat, a 29-year-old professional guide in Mysuru. I have a deep passion for the royal history of Karnataka and specialize in storytelling about our heritage and traditions.",
        verified: 1,
        response_time: "within 30 mins",
        experience: "6 years",
        completed_tours: 290,
        joined_date: "2022-11-20"
    }
];

// Used Avatar Tracking to avoid duplicates between featured and random
const usedAvatarIds = new Set(featuredGuides.map(g => g.avatar.split('photo-')[1].split('?')[0]));

const allMockGuides: any[] = [];
let guideIdCounter = 1;

// Shuffle function for unique avatar allocation
const shuffle = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

// Filter used IDs out of pools BEFORE shuffling
const finalFemalePool = shuffle([...new Set(femaleAvatarPool)].filter(id => !usedAvatarIds.has(id)));
const finalMalePool = shuffle([...new Set(maleAvatarPool)].filter(id => !usedAvatarIds.has(id)));

Object.entries(stateData).forEach(([stateName, data]) => {
    data.cities.forEach((cityName: string) => {
        const count = ["Chennai", "Bengaluru", "Hyderabad"].includes(cityName) ? 8 : 5;

        for (let i = 0; i < count; i++) {
            const gender = Math.random() > 0.5 ? 'men' : 'women';
            const namePool = data.names[gender];
            const lastNamePool = data.lastNames;
            const firstName = namePool[Math.floor(Math.random() * namePool.length)];
            const lastName = lastNamePool[Math.floor(Math.random() * lastNamePool.length)];
            const name = `${firstName} ${lastName}`;

            // Pop unique avatar
            let avatarId;
            if (gender === 'women') {
                avatarId = finalFemalePool.pop() || femaleAvatarPool[0];
            } else {
                avatarId = finalMalePool.pop() || maleAvatarPool[0];
            }

            // TRACK USED ID
            usedAvatarIds.add(avatarId);

            const avatar = `https://images.unsplash.com/photo-${avatarId}?q=80&w=400&h=400&fit=crop`;
            const trait = data.traits[Math.floor(Math.random() * data.traits.length)];
            const languages = ["English", ...data.languages];
            if (Math.random() > 0.7) languages.push("Hindi");

            const age = 24 + Math.floor(Math.random() * 16); // Strictly 24 to 40

            allMockGuides.push({
                id: `guide_${guideIdCounter++}`,
                name,
                avatar,
                location: `${cityName}, ${stateName}`,
                languages: JSON.stringify(languages),
                rating: Number((4.6 + (Math.random() * 0.4)).toFixed(1)),
                review_count: 5 + Math.floor(Math.random() * 50),
                hourly_rate: 350 + Math.floor(Math.random() * 450),
                specialties: JSON.stringify([trait, "Local Culture"]),
                bio: `Hi! I'm ${firstName}, a ${age}-year-old professional guide in ${cityName}. I specialize in ${trait.toLowerCase()} and love sharing our local ${stateName} traditions.`,
                verified: Math.random() > 0.4 ? 1 : 0,
                response_time: "within 2 hours",
                experience: `${2 + Math.floor(Math.random() * 10)} years`,
                completed_tours: 20 + Math.floor(Math.random() * 150),
                joined_date: "2023-01-15",
                availability: JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            });
        }
    });
});

const users = [
    {
        id: "tourist_1",
        name: "Test Tourist",
        email: "tourist@test.com",
        password: "password123",
        role: "tourist",
        avatar: "https://github.com/shadcn.png",
        location: "Mumbai",
        bio: "Traveler"
    },
    {
        id: "guide_demo",
        name: "Rajesh Kumar",
        email: "guide@test.com",
        password: "password123",
        role: "guide",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&fit=crop",
        location: "Chennai, Tamil Nadu",
        bio: "Local guide demo account"
    }
];

const seed = async () => {
    console.log('🚀 Running Final Quality Seeding with ZERO Duplicate Check...');
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash('password123', salt);

        await db.prepare('DELETE FROM messages').run();
        await db.prepare('DELETE FROM bookings').run();
        await db.prepare('DELETE FROM reviews').run();
        await db.prepare('DELETE FROM favorites').run();
        await db.prepare('DELETE FROM guide_availability_slots').run();
        await db.prepare('DELETE FROM posts').run();
        await db.prepare('DELETE FROM saved_itineraries').run();
        await db.prepare('DELETE FROM guides').run();
        await db.prepare('DELETE FROM users').run();

        const insertUserQuery = 'INSERT INTO users (id, name, email, password, role, avatar, location, bio, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        for (const user of users) {
            await db.prepare(insertUserQuery).run(
                user.id, user.name, user.email, hashedPass, user.role, user.avatar, user.location, user.bio,
                user.location ? user.location.split(',')[0].trim() : "Unknown"
            );
        }

        const insertGuideQuery = `
            INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Featured
        for (const g of featuredGuides) {
            // First insert into users table so they can log in
            await db.prepare('INSERT INTO users (id, name, email, password, role, avatar, location, bio, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
                .run(g.id, g.name, `${g.id.toLowerCase()}@guide.com`, hashedPass, 'guide', g.avatar, g.location, g.bio, g.location.split(',')[0].trim());

            await db.prepare(insertGuideQuery).run(
                g.id, g.name, g.avatar, g.location, g.languages, g.rating, g.review_count, g.hourly_rate, g.specialties,
                g.bio, g.verified, g.response_time, g.experience, g.completed_tours, g.joined_date,
                JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]), "[]", "[]"
            );
        }

        // Mocked
        for (const g of allMockGuides) {
            // First insert into users table so they can log in
            await db.prepare('INSERT INTO users (id, name, email, password, role, avatar, location, bio, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
                .run(g.id, g.name, `${g.id}@guide.com`, hashedPass, 'guide', g.avatar, g.location, g.bio, g.location.split(',')[0].trim());

            // Then insert into guides table
            await db.prepare(insertGuideQuery).run(
                g.id, g.name, g.avatar, g.location, g.languages, g.rating, g.review_count, g.hourly_rate, g.specialties,
                g.bio, g.verified, g.response_time, g.experience, g.completed_tours, g.joined_date,
                g.availability, g.itinerary, g.hidden_gems
            );
        }

        console.log(`✅ Success! Seeded ${allMockGuides.length + featuredGuides.length} unique, high-quality guides.`);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

seed();
