import {} from "../types";
// Helper for random avatars
const getAvatar = (gender, id) => `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
const unsplashAvatars = [
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop", // Professional Man 1
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop", // Professional Woman 1
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop", // Professional Man 2
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop", // Professional Woman 2
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop", // Man
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", // Woman
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", // Man
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop", // Woman
];
// Reusing specific top-tier guides from before
const chennaiGuides = [
    {
        id: "ch_1",
        name: "Rajesh Kumar",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
        location: "Chennai, Tamil Nadu",
        languages: ["English", "Tamil", "Hindi"],
        rating: 4.9,
        reviewCount: 124,
        hourlyRate: 500,
        specialties: ["Heritage Walks", "Food Tours", "Temple Architecture"],
        bio: "Hi! I'm Rajesh, a history buff and foodie. I've lived in Chennai for 20 years and love showing people the hidden alleys of Mylapore and the best filter coffee spots that aren't on Google Maps.",
        verified: true,
        responseTime: "1 hour",
        completedTours: 142,
        joinedDate: "2023-01-15",
        availability: ["Mon", "Tue", "Wed", "Fri", "Sat"],
        itinerary: [
            { time: "09:00 AM", activity: "Meet at Kapaleeshwarar Temple Tank", icon: "map-pin" },
            { time: "10:30 AM", activity: "Hidden Alley Walk in Mylapore", icon: "footprints" },
            { time: "11:30 AM", activity: "Try the 'Best Filter Coffee' (My Secret Spot)", icon: "coffee" },
            { time: "01:00 PM", activity: "Traditional Banana Leaf Lunch", icon: "utensils" }
        ],
        hiddenGems: [
            { name: "The 200yo Pottery House", image: "https://images.unsplash.com/photo-1593118845874-9f79c6b77265?q=80&w=2070&auto=format&fit=crop", description: "A hidden workshop where they still make pots the Chola way." }
        ]
    },
    ...Array.from({ length: 9 }).map((_, i) => ({
        id: `ch_${i + 2}`,
        name: ["Arun Vijay", "Deepa S", "Senthil N", "Meera K", "Karthik R", "Lakshmi P", "Vikram S", "Anitha M", "Siva G"][i],
        avatar: unsplashAvatars[i % unsplashAvatars.length],
        location: "Chennai, Tamil Nadu",
        languages: ["English", "Tamil"],
        rating: 4.5 + (Math.random() * 0.4),
        reviewCount: 20 + Math.floor(Math.random() * 100),
        hourlyRate: 400 + Math.floor(Math.random() * 400),
        specialties: ["City Highlights", "Shopping", "Food"],
        bio: "Passionate local guide helping you discover the soul of Chennai. From beaches to temples, I know it all.",
        verified: Math.random() > 0.3,
        responseTime: "2 hours",
        completedTours: 10 + Math.floor(Math.random() * 50),
        joinedDate: "2023-05-12",
        availability: ["Mon", "Sat", "Sun"]
    }))
];
const kochiGuides = [
    {
        id: "kc_1",
        name: "Priya Menon",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
        location: "Kochi, Kerala",
        languages: ["English", "Malayalam", "French"],
        rating: 4.8,
        reviewCount: 98,
        hourlyRate: 750,
        specialties: ["Art & Culture", "Backwaters", "Colonial History"],
        bio: "Namaste! I'm Priya. I grew up in Fort Kochi surrounded by art and history. Let me take you through the colonial bungalows.",
        verified: true,
        responseTime: "30 minutes",
        completedTours: 95,
        joinedDate: "2023-04-10",
        availability: ["Wed", "Thu", "Fri", "Sat", "Sun"],
        itinerary: [
            { time: "04:00 PM", activity: "Walk through Jew Town", icon: "shopping-bag" },
            { time: "05:30 PM", activity: "Sunset at a secret private jetty", icon: "sunset" }
        ]
    },
    ...Array.from({ length: 9 }).map((_, i) => ({
        id: `kc_${i + 2}`,
        name: ["Raju Thomas", "Sneha George", "Abdullah K", "Rose Mary", "Mathew J", "Fathima S", "Joseph P", "Vidya N", "Rahul K"][i],
        avatar: getAvatar(i % 2 === 0 ? 'men' : 'women', 30 + i),
        location: "Kochi, Kerala",
        languages: ["English", "Malayalam", "Arabic"],
        rating: 4.6 + (Math.random() * 0.3),
        reviewCount: 15 + Math.floor(Math.random() * 80),
        hourlyRate: 600 + Math.floor(Math.random() * 300),
        specialties: ["Spice Markets", "Houseboats", "History"],
        bio: "Welcome to God's Own Country! I specialize in showing you the authentic side of Kochi.",
        verified: true,
        responseTime: "1 hour",
        completedTours: 30 + Math.floor(Math.random() * 60),
        joinedDate: "2023-06-01",
        availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }))
];
const tvmGuides = [
    {
        id: "tv_1",
        name: "Anjali Menon",
        avatar: "https://images.unsplash.com/photo-1693649977898-19984f0d231f?w=400&h=400&fit=crop",
        location: "Thiruvananthapuram, Kerala",
        languages: ["English", "Malayalam", "Hindi"],
        rating: 4.8,
        reviewCount: 68,
        hourlyRate: 300,
        specialties: ["Beach Tours", "Ayurveda", "Temples"],
        bio: "Wellness Tourism Specialist & Certified Tour Guide. Kerala native with expertise in Ayurvedic wellness and temple heritage.",
        verified: true,
        responseTime: "2 hours",
        completedTours: 95,
        joinedDate: "2023-04-10",
        availability: ["Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    ...Array.from({ length: 9 }).map((_, i) => ({
        id: `tv_${i + 2}`,
        name: ["Manoj Nair", "Divya Pillai", "Vishnu S", "Greeshma R", "Kiran V", "Parvathy A", "Harish K", "Soumya L", "Unni M"][i],
        avatar: unsplashAvatars[(i + 4) % unsplashAvatars.length],
        location: "Thiruvananthapuram, Kerala",
        languages: ["English", "Malayalam"],
        rating: 4.5 + (Math.random() * 0.4),
        reviewCount: 10 + Math.floor(Math.random() * 50),
        hourlyRate: 300 + Math.floor(Math.random() * 200),
        specialties: ["Padmanabhaswamy Temple", "Museums", "Food"],
        bio: "Explore the capital city with a local expert! I know the best spots for sadhya and sunset views.",
        verified: Math.random() > 0.5,
        responseTime: "4 hours",
        completedTours: 20 + Math.floor(Math.random() * 40),
        joinedDate: "2023-08-15",
        availability: ["Sat", "Sun"]
    }))
];
const vizagGuides = [
    {
        id: "vz_1",
        name: "Vikram Reddy",
        avatar: "https://media.istockphoto.com/id/1322664345/photo/young-indian-businessman-with-his-freight-forward-lorry-or-truck.jpg?s=1024x1024&w=is&k=20&c=U9lFLmQ24qDw3L3fvJw7V-h0OskdPgMheoCIkMq78Qw=",
        location: "Visakhapatnam, Andhra Pradesh",
        languages: ["English", "Telugu", "Hindi"],
        rating: 4.9,
        reviewCount: 76,
        hourlyRate: 320,
        specialties: ["Beach Tours", "Naval History", "Coastal Cuisine"],
        bio: "Coastal Tourism Expert. Showing you the Jewel of the East Coast.",
        verified: true,
        responseTime: "1 hour",
        completedTours: 118,
        joinedDate: "2023-02-05",
        availability: ["Mon", "Tue", "Thu", "Fri", "Sat"],
    },
    ...Array.from({ length: 9 }).map((_, i) => ({
        id: `vz_${i + 2}`,
        name: ["Srinivas Rao", "Padma L", "Naveen K", "Swathi M", "Ravi Teja", "Bhavana S", "Krishna C", "Hima Bindu", "Prasad V"][i],
        avatar: getAvatar(i % 2 === 0 ? 'men' : 'women', 50 + i),
        location: "Visakhapatnam, Andhra Pradesh",
        languages: ["English", "Telugu"],
        rating: 4.4 + (Math.random() * 0.5),
        reviewCount: 20 + Math.floor(Math.random() * 90),
        hourlyRate: 300 + Math.floor(Math.random() * 250),
        specialties: ["Araku Valley", "Submarine Museum", "Coffee"],
        bio: "I love Vizag! Let me take you on a drive along the coast or a trek in the hills.",
        verified: true,
        responseTime: "3 hours",
        completedTours: 40 + Math.floor(Math.random() * 70),
        joinedDate: "2023-03-20",
        availability: ["Mon", "Sat", "Sun"]
    }))
];
export const mockGuides = [
    ...chennaiGuides,
    ...kochiGuides,
    ...tvmGuides,
    ...vizagGuides
];
export const mockReviews = [
    {
        id: "1",
        guideId: "ch_1",
        userName: "Rahul Verma",
        userAvatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop",
        rating: 5,
        comment: "Excellent guide! Rajesh showed us the real Chennai.",
        date: "2024-10-15",
        tourType: "Heritage Tour",
    },
    {
        id: "2",
        guideId: "kc_1",
        userName: "Emma Thompson",
        userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
        rating: 5,
        comment: "Priya was amazing. The secret sunset spot was the highlight of our trip!",
        date: "2024-09-28",
        tourType: "Culture Tour",
    }
];
