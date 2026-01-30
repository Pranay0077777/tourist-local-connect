import db from './index';

// Mock Data
const guides = [
    {
        id: "1",
        name: "Priya Raman",
        avatar: "https://images.unsplash.com/photo-1679335067355-40223d903144?w=200&h=200&fit=crop",
        location: "Chennai, Tamil Nadu",
        languages: JSON.stringify(["English", "Tamil", "Hindi"]),
        rating: 4.9,
        review_count: 87,
        hourly_rate: 350,
        specialties: JSON.stringify(["Temple Tours", "South Indian Cuisine", "Marina Beach"]),
        bio: "Certified Tourism Guide | B.A. in History & Tourism Management | 26 years old | Chennai native with 3+ years of experience in cultural tourism. Specialized in temple architecture, heritage walks, and authentic South Indian culinary experiences. Passionate about showcasing Chennai's rich Dravidian heritage and modern culture. Languages: Tamil (Native), English (Fluent), Hindi (Conversational). Professional certifications: Tamil Nadu Tourism Certified Guide, First Aid & Safety Training.",
        verified: 1,
        response_time: "1 hour",
        experience: "3+ years",
        completed_tours: 142,
        joined_date: "2023-01-15",
        availability: JSON.stringify(["Mon", "Tue", "Wed", "Fri", "Sat"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "2",
        name: "Rajesh Murthy",
        avatar: "https://images.unsplash.com/photo-1681141190048-b3f4b9ab3b5a?w=200&h=200&fit=crop",
        location: "Mysuru, Karnataka",
        languages: JSON.stringify(["English", "Kannada", "Hindi"]),
        rating: 5.0,
        review_count: 92,
        hourly_rate: 400,
        specialties: JSON.stringify(["Palace Tours", "Yoga & Wellness", "Silk Shopping"]),
        bio: "Professional Heritage Guide | Bachelor's in Tourism Management, University of Mysore | Certified Yoga Instructor (RYT-200) | 28 years old | 4+ years guiding experience specializing in royal heritage, wellness tourism, and cultural immersion. Expert knowledge of Mysore Palace architecture, Wodeyar dynasty history, and traditional silk industry. Languages: Kannada (Native), English (Fluent), Hindi (Fluent). Certifications: Karnataka Tourism Department Licensed Guide, Heritage Conservation Training.",
        verified: 1,
        response_time: "30 minutes",
        experience: "4+ years",
        completed_tours: 156,
        joined_date: "2022-06-20",
        availability: JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "3",
        name: "Anjali Menon",
        avatar: "https://images.unsplash.com/photo-1693649977898-19984f0d231f?w=200&h=200&fit=crop",
        location: "Thiruvananthapuram, Kerala",
        languages: JSON.stringify(["English", "Malayalam", "Hindi"]),
        rating: 4.8,
        review_count: 68,
        hourly_rate: 300,
        specialties: JSON.stringify(["Beach Tours", "Ayurveda", "Local Temples"]),
        bio: "Wellness Tourism Specialist | B.Sc. in Ayurveda & Yoga | Certified Tour Guide | 25 years old | Kerala native with expertise in Ayurvedic wellness, coastal tourism, and temple heritage. 2+ years of experience connecting tourists with authentic Ayurveda centers and serene beach destinations. Passionate about promoting Kerala's wellness culture and natural beauty. Languages: Malayalam (Native), English (Fluent), Hindi (Conversational). Certifications: Kerala Tourism Certified Guide, Ayurveda Awareness Program.",
        verified: 1,
        response_time: "2 hours",
        experience: "2+ years",
        completed_tours: 95,
        joined_date: "2023-04-10",
        availability: JSON.stringify(["Wed", "Thu", "Fri", "Sat", "Sun"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "4",
        name: "Vikram Reddy",
        avatar: "https://media.istockphoto.com/id/1322664345/photo/young-indian-businessman-with-his-freight-forward-lorry-or-truck.jpg?s=1024x1024&w=is&k=20&c=U9lFLmQ24qDw3L3fvJw7V-h0OskdPgMheoCIkMq78Qw=",
        location: "Visakhapatnam, Andhra Pradesh",
        languages: JSON.stringify(["English", "Telugu", "Hindi"]),
        rating: 4.9,
        review_count: 76,
        hourly_rate: 320,
        specialties: JSON.stringify(["Beach Tours", "Naval History", "Coastal Cuisine"]),
        bio: "Coastal Tourism Expert | B.Tech in Marine Engineering turned Professional Guide | 27 years old | 3+ years specializing in Visakhapatnam's naval heritage, beach tourism, and coastal cuisine. Former marine professional with unique insights into submarine museums and maritime history. Enthusiastic about showcasing the City of Destiny's natural beauty and seafood culture. Languages: Telugu (Native), English (Fluent), Hindi (Fluent). Certifications: Andhra Pradesh Tourism Licensed Guide, Maritime Heritage Training.",
        verified: 1,
        response_time: "1 hour",
        experience: "3+ years",
        completed_tours: 118,
        joined_date: "2023-02-05",
        availability: JSON.stringify(["Mon", "Tue", "Thu", "Fri", "Sat"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "5",
        name: "Arjun Kumar",
        avatar: "https://media.istockphoto.com/id/1394069878/photo/man-vlogging-on-the-beach.jpg?s=612x612&w=0&k=20&c=Udcx9DP0EYpYUxkvFw8O2ZhgeDmeNPVda6ZYnQ4V9J8=",
        location: "Puducherry, Puducherry",
        languages: JSON.stringify(["English", "Tamil", "French", "Hindi"]),
        rating: 4.7,
        review_count: 54,
        hourly_rate: 380,
        specialties: JSON.stringify(["French Quarter", "Beach Tours", "Auroville"]),
        bio: "Multilingual Heritage Guide | Diploma in Hospitality & Tourism Management | French Language Certified (DELF B2) | 24 years old | Puducherry resident specializing in Franco-Tamil heritage, spiritual tourism, and Auroville experiences. 2+ years connecting international tourists with Puducherry's unique colonial charm and multicultural identity. Languages: Tamil (Native), English (Fluent), French (Advanced), Hindi (Conversational). Certifications: Puducherry Tourism Certified Guide, Heritage Interpretation Training.",
        verified: 1,
        response_time: "3 hours",
        experience: "2+ years",
        completed_tours: 82,
        joined_date: "2023-11-20",
        availability: JSON.stringify(["Mon", "Wed", "Fri", "Sat", "Sun"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "6",
        name: "Meera Reddy",
        avatar: "https://images.unsplash.com/photo-1735845929510-48e0ecdb53d2?w=200&h=200&fit=crop",
        location: "Hyderabad, Telangana",
        languages: JSON.stringify(["English", "Hindi", "Telugu"]),
        rating: 4.8,
        review_count: 71,
        hourly_rate: 360,
        specialties: JSON.stringify(["Historical Monuments", "Biryani Tours", "Pearl Shopping"]),
        bio: "Cultural & Culinary Tourism Specialist | M.A. in History, Osmania University | Professional Food Tour Guide | 29 years old | 4+ years expertise in Nizami heritage, Hyderabad's culinary scene, and pearl trade history. History graduate passionate about connecting tourists with authentic biryani experiences and historical monuments. Languages: Telugu (Native), Hindi (Fluent), English (Fluent). Certifications: Telangana Tourism Department Licensed Guide, Food Safety & Hygiene Certified.",
        verified: 1,
        response_time: "2 hours",
        experience: "4+ years",
        completed_tours: 105,
        joined_date: "2022-09-12",
        availability: JSON.stringify(["Tue", "Wed", "Thu", "Fri", "Sat"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "7",
        name: "Karthik Menon",
        avatar: "https://plus.unsplash.com/premium_photo-1682092829937-bb5b289be2c3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG1lbiUyMGxvY2FsJTIwc291dGglMjBpbmRpYXxlbnwwfHwwfHx8MA%3D%3D",
        location: "Kochi, Kerala",
        languages: JSON.stringify(["English", "Hindi", "Malayalam", "Tamil"]),
        rating: 5.0,
        review_count: 63,
        hourly_rate: 330,
        specialties: JSON.stringify(["Backwater Tours", "Spice Markets", "Kathakali Dance"]),
        bio: "Backwater & Cultural Tourism Expert | Bachelor's in Tourism & Travel Management | Certified Kathakali Performer (Foundation Level) | 26 years old | Kochi native with 3+ years specializing in backwater experiences, spice trade heritage, and traditional performing arts. Passionate about showcasing God's Own Country's natural beauty and cultural richness. Languages: Malayalam (Native), English (Fluent), Hindi (Fluent), Tamil (Conversational). Certifications: Kerala Tourism Certified Guide, Traditional Arts & Culture Training.",
        verified: 1,
        response_time: "1 hour",
        experience: "3+ years",
        completed_tours: 89,
        joined_date: "2023-06-01",
        availability: JSON.stringify(["Sun", "Mon", "Tue", "Wed", "Thu"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "8",
        name: "Kavita Nair",
        avatar: "https://images.unsplash.com/photo-1652953233042-35a88a3e3388?w=200&h=200&fit=crop",
        location: "Coimbatore, Tamil Nadu",
        languages: JSON.stringify(["English", "Tamil", "Malayalam"]),
        rating: 4.9,
        review_count: 58,
        hourly_rate: 280,
        specialties: JSON.stringify(["Hill Stations", "Textile Tours", "Temple Heritage"]),
        bio: "Textile Heritage & Eco-Tourism Guide | MBA in Tourism Management | Industrial Heritage Specialist | 25 years old | 2+ years experience showcasing Coimbatore's textile industry, Nilgiri hill stations, and temple heritage. Business graduate with expertise in connecting tourists with the Manchester of South India's industrial culture and natural attractions. Languages: Tamil (Native), English (Fluent), Malayalam (Conversational). Certifications: Tamil Nadu Tourism Certified Guide, Eco-Tourism Training.",
        verified: 1,
        response_time: "2 hours",
        experience: "2+ years",
        completed_tours: 86,
        joined_date: "2023-08-18",
        availability: JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Sat", "Sun"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "9",
        name: "Aditya Iyer",
        avatar: "https://media.istockphoto.com/id/1284080305/photo/driver-in-uniform-entering-the-bus.jpg?s=612x612&w=0&k=20&c=kDjtXNyjV3GgSuKrzBFZvVa6ICdHX7vcMBHFCxjl1WU=",
        location: "Madurai, Tamil Nadu",
        languages: JSON.stringify(["English", "Tamil", "Hindi"]),
        rating: 4.9,
        review_count: 94,
        hourly_rate: 340,
        specialties: JSON.stringify(["Temple Architecture", "Street Food", "Textile Shopping"]),
        bio: "Temple Architecture Specialist | B.Arch. from Thiagarajar College of Engineering | Heritage Conservation Enthusiast | 28 years old | 4+ years guiding experience with deep expertise in Dravidian architecture, particularly Meenakshi Temple complex. Architecture professional passionate about bringing ancient temples to life through storytelling. Specialized in street food tours and textile shopping experiences. Languages: Tamil (Native), English (Fluent), Hindi (Conversational). Certifications: Tamil Nadu Tourism Licensed Guide, Archaeological Survey of India Heritage Training.",
        verified: 1,
        response_time: "1 hour",
        experience: "4+ years",
        completed_tours: 138,
        joined_date: "2022-10-12",
        availability: JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "10",
        name: "Lakshmi Iyer",
        avatar: "https://media.istockphoto.com/id/1254176393/photo/portrait-of-a-happy-woman-of-indian-ethnicity.jpg?s=612x612&w=0&k=20&c=In7iJKJ0GXYatpVnLbSRqN-bbqwnXJqy4C0AjGgyUzE=",
        location: "Bengaluru, Karnataka",
        languages: JSON.stringify(["English", "Hindi", "Kannada", "Tamil"]),
        rating: 4.7,
        review_count: 49,
        hourly_rate: 450,
        specialties: JSON.stringify(["Tech Hub Tours", "Garden City", "Craft Beer"]),
        bio: "Technology & Urban Tourism Guide | B.Tech in Computer Science, IIT | Former Software Engineer turned Professional Guide | 27 years old | 2+ years specializing in tech hub tours, startup ecosystem, garden heritage, and craft beer experiences. Unique perspective combining tech industry insights with Bengaluru's urban culture. Languages: English (Fluent), Kannada (Native), Hindi (Fluent), Tamil (Conversational). Certifications: Karnataka Tourism Department Licensed Guide, Technology Park Tour Specialist.",
        verified: 1,
        response_time: "2 hours",
        experience: "2+ years",
        completed_tours: 73,
        joined_date: "2024-01-08",
        availability: JSON.stringify(["Wed", "Thu", "Fri", "Sat", "Sun"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "11",
        name: "Deepa Krishnan",
        avatar: "https://media.istockphoto.com/id/1313502972/photo/portrait-of-beautiful-woman-having-fun.jpg?s=612x612&w=0&k=20&c=DHGWp3wIoSlpjK9xFdARpgpyo4t-hIzuqOSx5ZyRsHA=",
        location: "Kochi, Kerala",
        languages: JSON.stringify(["English", "Malayalam", "Hindi", "Tamil"]),
        rating: 4.8,
        review_count: 52,
        hourly_rate: 310,
        specialties: JSON.stringify(["Fort Kochi Heritage", "Jewish Quarter", "Chinese Fishing Nets"]),
        bio: "Colonial History & Maritime Heritage Guide | M.A. in History, Cochin University | Jewish Heritage Specialist | 26 years old | 2+ years expertise in Fort Kochi's colonial architecture, Jewish synagogue history, and maritime trade heritage. Passionate about multicultural history of Kochi as India's spice trade gateway. Languages: Malayalam (Native), English (Fluent), Hindi (Conversational), Tamil (Basic). Certifications: Kerala Tourism Certified Guide, Colonial Architecture Training, Jewish Heritage Interpretation Course.",
        verified: 1,
        response_time: "2 hours",
        experience: "2+ years",
        completed_tours: 78,
        joined_date: "2023-07-15",
        availability: JSON.stringify(["Mon", "Tue", "Wed", "Fri", "Sat", "Sun"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    },
    {
        id: "12",
        name: "Suresh Naidu",
        avatar: "https://media.istockphoto.com/id/1398271493/photo/college-student-with-book-and-backpack-outdoor.jpg?s=612x612&w=0&k=20&c=ybXfCOTANR-Q1_mp-EBEZWbqpW3vTOxCUktXSG0ysAk=",
        location: "Bengaluru, Karnataka",
        languages: JSON.stringify(["English", "Kannada", "Hindi", "Tamil"]),
        rating: 4.9,
        review_count: 81,
        hourly_rate: 380,
        specialties: JSON.stringify(["Historical Temples", "Bull Temple", "Lalbagh Botanical Garden"]),
        bio: "Heritage & Botanical Tourism Specialist | B.Sc. in Botany & Environmental Science | Horticulture Enthusiast | 29 years old | 3+ years specializing in Bengaluru's temple heritage, botanical gardens, and environmental tourism. Expertise in Lalbagh's flora diversity, historical temple architecture, and urban green spaces. Former botanist bringing scientific perspective to garden tours. Languages: Kannada (Native), English (Fluent), Hindi (Fluent), Tamil (Conversational). Certifications: Karnataka Tourism Licensed Guide, Botanical Tourism Training, Environmental Conservation Course.",
        verified: 1,
        response_time: "1 hour",
        experience: "3+ years",
        completed_tours: 112,
        joined_date: "2022-11-20",
        availability: JSON.stringify(["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"]),
        itinerary: JSON.stringify([]),
        hidden_gems: JSON.stringify([])
    }
];

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
const seed = () => {
    console.log('Seeding database...');

    // Clear existing
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM guides').run();
    db.prepare('DELETE FROM bookings').run();
    db.prepare('DELETE FROM reviews').run();
    db.prepare('DELETE FROM favorites').run();

    // Insert Users
    const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role, avatar, location, bio) VALUES (@id, @name, @email, @password, @role, @avatar, @location, @bio)');
    for (const user of users) {
        insertUser.run(user);
    }

    // Insert Guides
    const insertGuide = db.prepare(`
        INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems) 
        VALUES (@id, @name, @avatar, @location, @languages, @rating, @review_count, @hourly_rate, @specialties, @bio, @verified, @response_time, @experience, @completed_tours, @joined_date, @availability, @itinerary, @hidden_gems)
    `);

    // Create Favorites Table if not exists (redundant if schema.sql used but good for standalone)
    db.exec(`
        CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            guide_id TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(guide_id) REFERENCES guides(id)
        );
    `);

    for (const guide of guides) {
        insertGuide.run(guide);
    }

    console.log(`Seeding complete! Added ${users.length} users and ${guides.length} guides.`);
};

seed();
