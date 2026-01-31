import db from './index';

// Mock Data
const states = [
    { name: "Tamil Nadu", cities: ["Chennai", "Madurai"], big: true },
    { name: "Karnataka", cities: ["Bengaluru", "Mysuru"], big: true },
    { name: "Telangana", cities: ["Hyderabad", "Warangal"], big: true },
    { name: "Kerala", cities: ["Kochi", "Thiruvananthapuram"], big: false },
    { name: "Andhra Pradesh", cities: ["Visakhapatnam"], big: false }
];

const allMockGuides: any[] = [];
let guideIdCounter = 1;

states.forEach(state => {
    state.cities.forEach((cityName, cityIdx) => {
        let count = state.big ? (cityIdx === 0 ? 8 : 4) : 5;
        if (cityName === "Madurai" || cityName === "Mysuru") count = 5;

        for (let i = 0; i < count; i++) {
            const id = `${guideIdCounter++}`;
            const gender = Math.random() > 0.5 ? 'men' : 'women';
            const avatarId = Math.floor(Math.random() * 90);

            allMockGuides.push({
                id,
                name: `${["Arun", "Senthil", "Meera", "Deepa", "Karthik", "Lakshmi", "Anitha", "Siva", "Rahul", "Priya", "Vikram", "Sneha"][Math.floor(Math.random() * 12)]} ${["Kumar", "S", "Reddy", "Menon", "Nair", "Rao", "Vijay", "Vijay", "Iyer", "Naidu"][Math.floor(Math.random() * 10)]}`,
                avatar: `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`,
                location: `${cityName}, ${state.name}`,
                languages: JSON.stringify(["English", ["Tamil", "Kannada", "Telugu", "Malayalam", "Hindi"][Math.floor(Math.random() * 5)]]),
                rating: Number((4.5 + (Math.random() * 0.5)).toFixed(1)),
                review_count: 10 + Math.floor(Math.random() * 150),
                hourly_rate: 300 + Math.floor(Math.random() * 500),
                specialties: JSON.stringify([["Heritage Walks", "Food Tours", "Temple Architecture", "Beach Tours", "Shopping", "Tech Hub Tours", "Nature Walks"][Math.floor(Math.random() * 7)]]),
                bio: `Experienced guide in ${cityName}. I love sharing the unique stories of our city's culture and heritage.`,
                verified: 1,
                response_time: "1 hour",
                experience: `${2 + Math.floor(Math.random() * 10)} years`,
                completed_tours: 50 + Math.floor(Math.random() * 200),
                joined_date: "2023-01-15",
                availability: JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            });
        }
    });
});

const guides = allMockGuides;


const users = [
    {
        id: "tourist_1",
        name: "Test Tourist",
        email: "tourist@test.com",
        password: "password123",
        role: "tourist",
        avatar: "https://github.com/shadcn.png",
        location: "Mumbai",
        bio: "Love traveling!"
    },
    {
        id: "ch_1",
        name: "Rajesh Kumar",
        email: "guide@test.com",
        password: "password123",
        role: "guide",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
        location: "Chennai",
        bio: "Hi! I'm Rajesh, a history buff and foodie."
    }
];

// Seeding Logic
const seed = async () => {
    console.log('Seeding database...');

    try {
        // Clear existing - Order matters for Foreign Keys
        await db.prepare('DELETE FROM favorites').run();
        await db.prepare('DELETE FROM reviews').run();
        await db.prepare('DELETE FROM bookings').run();
        await db.prepare('DELETE FROM guides').run();
        await db.prepare('DELETE FROM users').run();

        // Insert Users
        const insertUserQuery = 'INSERT INTO users (id, name, email, password, role, avatar, location, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        for (const user of users) {
            await db.prepare(insertUserQuery).run(user.id, user.name, user.email, user.password, user.role, user.avatar, user.location, user.bio);
        }

        // Insert Guides
        const insertGuideQuery = `
            INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const guide of guides) {
            await db.prepare(insertGuideQuery).run(
                guide.id, guide.name, guide.avatar, guide.location, guide.languages,
                guide.rating, guide.review_count, guide.hourly_rate, guide.specialties,
                guide.bio, guide.verified, guide.response_time, guide.experience,
                guide.completed_tours, guide.joined_date, guide.availability,
                guide.itinerary, guide.hidden_gems
            );
        }

        console.log(`Seeding complete! Added ${users.length} users and ${guides.length} guides.`);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
