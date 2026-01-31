import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import db from './db';
import guideRoutes from './routes/guides';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import userRoutes from './routes/users';
import messageRoutes from './routes/messages';
import favoriteRoutes from './routes/favorites';
import reviewRoutes from './routes/reviews';
import availabilityRoutes from './routes/availability';
import uploadRoutes from './routes/upload';
import aiRoutes from './routes/ai';
import itineraryRoutes from './routes/itineraries';
import weatherRoutes from './routes/weather';
import communityRoutes from './routes/community';
import { translateWithAI, generateAIResponse } from './services/aiService';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    console.log(`[AUTH] Request Path: ${req.path}`);
    console.log(`[AUTH] Authorization Header: ${authHeader ? 'Bearer ' + authHeader.split(' ')[1].substring(0, 10) + '...' : 'MISSING'}`);

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn(`[AUTH] Rejected: No token provided for ${req.path}`);
        return res.status(401).json({ error: "Authentication required" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, user: any) => {
        if (err) {
            console.error(`[AUTH] Rejected: Invalid token for ${req.path}`, err.message);
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

// Attach IO to request for routes
app.use((req: any, res, next) => {
    req.io = io;
    next();
});

app.use('/api/guides', guideRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', authenticateToken, bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/favorites', authenticateToken, favoriteRoutes);
app.use('/api/reviews', authenticateToken, reviewRoutes);
app.use('/api/availability', authenticateToken, availabilityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/itineraries', authenticateToken, itineraryRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/community', communityRoutes);

// Serve static uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Temporary Seed Route (Supports both SQLite and Postgres via abstraction)
app.post('/api/seed', async (req, res) => {
    try {
        console.log('Seeding via API...');
        const salt = await bcrypt.genSalt(10);
        const hashedUserPass = await bcrypt.hash('password123', salt);
        const hashedAdminPass = await bcrypt.hash('pranay123', salt);

        // Drop Tables (Note: CASCADE depends on Postgres version, keeping it simple)
        await db.exec('DROP TABLE IF EXISTS messages');
        await db.exec('DROP TABLE IF EXISTS bookings');
        await db.exec('DROP TABLE IF EXISTS reviews');
        await db.exec('DROP TABLE IF EXISTS favorites');
        await db.exec('DROP TABLE IF EXISTS guide_availability_slots');
        await db.exec('DROP TABLE IF EXISTS posts');
        await db.exec('DROP TABLE IF EXISTS saved_itineraries');
        await db.exec('DROP TABLE IF EXISTS users');
        await db.exec('DROP TABLE IF EXISTS guides');

        // Recreate Tables
        await db.exec(`
            CREATE TABLE users (
              id TEXT PRIMARY KEY,
              name TEXT,
              email TEXT UNIQUE,
              password TEXT,
              role TEXT,
              avatar TEXT,
              bio TEXT,
              location TEXT,
              phone TEXT,
              city TEXT,
              aadhar_number TEXT,
              dob TEXT,
              languages TEXT,
              specializations TEXT,
              hourly_rate INTEGER,
              preferences TEXT
            );

            CREATE TABLE guides (
              id TEXT PRIMARY KEY,
              name TEXT,
              avatar TEXT,
              location TEXT,
              languages TEXT,
              rating REAL,
              review_count INTEGER,
              hourly_rate INTEGER,
              specialties TEXT,
              bio TEXT,
              dob TEXT,
              verified INTEGER,
              response_time TEXT,
              experience TEXT,
              completed_tours INTEGER,
              joined_date TEXT,
              availability TEXT,
              itinerary TEXT,
              hidden_gems TEXT
            );

            CREATE TABLE bookings (
              id TEXT PRIMARY KEY,
              user_id TEXT,
              guide_id TEXT,
              date TEXT,
              time TEXT,
              status TEXT,
              total_price INTEGER,
              guests INTEGER
            );

            CREATE TABLE reviews (
              id TEXT PRIMARY KEY,
              guide_id TEXT,
              user_name TEXT,
              user_avatar TEXT,
              rating REAL,
              comment TEXT,
              date TEXT,
              tour_type TEXT
            );

            CREATE TABLE messages (
              id TEXT PRIMARY KEY,
              sender_id TEXT,
              receiver_id TEXT,
              text TEXT,
              translated_text TEXT,
              timestamp TEXT,
              is_read INTEGER
            );

            CREATE TABLE favorites (
              id TEXT PRIMARY KEY,
              user_id TEXT,
              guide_id TEXT
            );

            CREATE TABLE guide_availability_slots (
              id TEXT PRIMARY KEY,
              guide_id TEXT,
              date TEXT,
              status TEXT
            );

            CREATE TABLE posts (
              id TEXT PRIMARY KEY,
              user_id TEXT,
              user_name TEXT,
              user_avatar TEXT,
              content TEXT,
              image TEXT,
              city TEXT,
              likes INTEGER DEFAULT 0,
              comments TEXT,
              created_at TEXT
            );

            CREATE TABLE saved_itineraries (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                city TEXT,
                title TEXT,
                content TEXT,
                created_at TEXT
            );
        `);

        const unsplashAvatars = [
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        ];

        const getAvatar = (gender: 'men' | 'women', id: number) => `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;

        const chennaiGuides = [
            {
                id: "ch_1",
                name: "Rajesh Kumar",
                avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
                location: "Chennai, Tamil Nadu",
                languages: JSON.stringify(["English", "Tamil", "Hindi"]),
                rating: 4.9,
                review_count: 124,
                hourly_rate: 500,
                specialties: JSON.stringify(["Heritage Walks", "Food Tours", "Temple Architecture"]),
                bio: "History buff and foodie. I love sharing the stories that make Chennai unique. Join me for an unforgettable cultural journey.",
                verified: 1,
                response_time: "1 hour",
                experience: "4 years",
                completed_tours: 142,
                joined_date: "2023-01-15",
                availability: JSON.stringify(["Mon", "Tue", "Wed", "Fri", "Sat"]),
                itinerary: JSON.stringify([{ "time": "09:00 AM", "activity": "Meet at Kapaleeshwarar Temple", "icon": "map-pin" }]),
                hidden_gems: JSON.stringify([])
            },
            ...Array.from({ length: 9 }).map((_, i) => ({
                id: `ch_${i + 2}`,
                name: ["Arun Vijay", "Deepa S", "Senthil N", "Meera K", "Karthik R", "Lakshmi P", "Vikram S", "Anitha M", "Siva G"][i],
                avatar: unsplashAvatars[i % unsplashAvatars.length],
                location: "Chennai, Tamil Nadu",
                languages: JSON.stringify(["English", "Tamil"]),
                rating: Number((4.5 + (Math.random() * 0.4)).toFixed(1)),
                review_count: 20 + Math.floor(Math.random() * 100),
                hourly_rate: 400 + Math.floor(Math.random() * 400),
                specialties: JSON.stringify(["City Highlights", "Shopping", "Food"]),
                bio: "Passionate local guide helping you discover the soul of Chennai. From beaches to temples, I know it all.",
                verified: Math.random() > 0.3 ? 1 : 0,
                response_time: "2 hours",
                experience: "2 years",
                completed_tours: 10 + Math.floor(Math.random() * 50),
                joined_date: "2023-05-12",
                availability: JSON.stringify(["Mon", "Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            }))
        ];

        const kochiGuides = [
            {
                id: "kc_1",
                name: "Priya Menon",
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
                location: "Kochi, Kerala",
                languages: JSON.stringify(["English", "Malayalam", "French"]),
                rating: 4.8,
                review_count: 98,
                hourly_rate: 550,
                specialties: JSON.stringify(["Art & Culture", "Backwaters", "Colonial History"]),
                bio: "Namaste! I grew up in Fort Kochi surrounded by art and history. Let me show you the hidden gems of my hometown.",
                verified: 1,
                response_time: "30 minutes",
                experience: "3 years",
                completed_tours: 95,
                joined_date: "2023-04-10",
                availability: JSON.stringify(["Wed", "Thu", "Fri", "Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            },
            ...Array.from({ length: 9 }).map((_, i) => ({
                id: `kc_${i + 2}`,
                name: ["Raju Thomas", "Sneha George", "Abdullah K", "Rose Mary", "Mathew J", "Fathima S", "Joseph P", "Vidya N", "Rahul K"][i],
                avatar: getAvatar(i % 2 === 0 ? 'men' : 'women', 30 + i),
                location: "Kochi, Kerala",
                languages: JSON.stringify(["English", "Malayalam", "Arabic"]),
                rating: Number((4.6 + (Math.random() * 0.3)).toFixed(1)),
                review_count: 15 + Math.floor(Math.random() * 80),
                hourly_rate: 600 + Math.floor(Math.random() * 300),
                specialties: JSON.stringify(["Spice Markets", "Houseboats", "History"]),
                bio: "Welcome to God's Own Country! I specialize in showing you the authentic side of Kochi.",
                verified: 1,
                response_time: "1 hour",
                experience: "3 years",
                completed_tours: 30 + Math.floor(Math.random() * 60),
                joined_date: "2023-06-01",
                availability: JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            }))
        ];

        const tvmGuides = [
            {
                id: "tv_1",
                name: "Anjali Menon",
                avatar: "https://images.unsplash.com/photo-1693649977898-19984f0d231f?w=400&h=400&fit=crop",
                location: "Thiruvananthapuram, Kerala",
                languages: JSON.stringify(["English", "Malayalam", "Hindi"]),
                rating: 4.8,
                review_count: 68,
                hourly_rate: 300,
                specialties: JSON.stringify(["Beach Tours", "Ayurveda", "Temples"]),
                bio: "Wellness Tourism Specialist. Kerala native with expertise in Ayurvedic wellness and temple heritage.",
                verified: 1,
                response_time: "2 hours",
                experience: "5 years",
                completed_tours: 95,
                joined_date: "2023-04-10",
                availability: JSON.stringify(["Wed", "Thu", "Fri", "Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            },
            ...Array.from({ length: 9 }).map((_, i) => ({
                id: `tv_${i + 2}`,
                name: ["Manoj Nair", "Divya Pillai", "Vishnu S", "Greeshma R", "Kiran V", "Parvathy A", "Harish K", "Soumya L", "Unni M"][i],
                avatar: unsplashAvatars[(i + 4) % unsplashAvatars.length],
                location: "Thiruvananthapuram, Kerala",
                languages: JSON.stringify(["English", "Malayalam"]),
                rating: Number((4.5 + (Math.random() * 0.4)).toFixed(1)),
                review_count: 10 + Math.floor(Math.random() * 50),
                hourly_rate: 300 + Math.floor(Math.random() * 200),
                specialties: JSON.stringify(["Padmanabhaswamy Temple", "Museums", "Food"]),
                bio: "Explore the capital city with a local expert! I know the best spots for sadhya and sunset views.",
                verified: Math.random() > 0.5 ? 1 : 0,
                response_time: "4 hours",
                experience: "2 years",
                completed_tours: 20 + Math.floor(Math.random() * 40),
                joined_date: "2023-08-15",
                availability: JSON.stringify(["Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            }))
        ];

        const vizagGuides = [
            {
                id: "vz_1",
                name: "Vikram Reddy",
                avatar: "https://media.istockphoto.com/id/1322664345/photo/young-indian-businessman-with-his-freight-forward-lorry-or-truck.jpg?s=1024x1024&w=is&k=20&c=U9lFLmQ24qDw3L3fvJw7V-h0OskdPgMheoCIkMq78Qw=",
                location: "Visakhapatnam, Andhra Pradesh",
                languages: JSON.stringify(["English", "Telugu", "Hindi"]),
                rating: 4.9,
                review_count: 76,
                hourly_rate: 320,
                specialties: JSON.stringify(["Beach Tours", "Naval History", "Coastal Cuisine"]),
                bio: "Coastal Tourism Expert. Showing you the Jewel of the East Coast.",
                verified: 1,
                response_time: "1 hour",
                experience: "4 years",
                completed_tours: 118,
                joined_date: "2023-02-05",
                availability: JSON.stringify(["Mon", "Tue", "Thu", "Fri", "Sat"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            },
            ...Array.from({ length: 9 }).map((_, i) => ({
                id: `vz_${i + 2}`,
                name: ["Srinivas Rao", "Padma L", "Naveen K", "Swathi M", "Ravi Teja", "Bhavana S", "Krishna C", "Hima Bindu", "Prasad V"][i],
                avatar: getAvatar(i % 2 === 0 ? 'men' : 'women', 50 + i),
                location: "Visakhapatnam, Andhra Pradesh",
                languages: JSON.stringify(["English", "Telugu"]),
                rating: Number((4.4 + (Math.random() * 0.5)).toFixed(1)),
                review_count: 20 + Math.floor(Math.random() * 90),
                hourly_rate: 300 + Math.floor(Math.random() * 250),
                specialties: JSON.stringify(["Araku Valley", "Submarine Museum", "Coffee"]),
                bio: "I love Vizag! Let me take you on a drive along the coast or a trek in the hills.",
                verified: 1,
                response_time: "3 hours",
                experience: "3 years",
                completed_tours: 40 + Math.floor(Math.random() * 70),
                joined_date: "2023-03-20",
                availability: JSON.stringify(["Mon", "Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            }))
        ];

        // Hyd is already partially in Chennai list in original mock but adding explicitly if needed, 
        // but for now combining the 4 lists:
        const mockGuides = [...chennaiGuides, ...kochiGuides, ...tvmGuides, ...vizagGuides];

        for (const g of mockGuides) {
            await db.prepare(`
                INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(g.id, g.name, g.avatar, g.location, g.languages, g.rating, g.review_count, g.hourly_rate, g.specialties, g.bio, g.verified, g.response_time, g.experience, g.completed_tours, g.joined_date, g.availability, g.itinerary, g.hidden_gems);
        }

        // Insert Test Users
        await db.prepare('INSERT INTO users (id, name, email, password, role, avatar, location, bio, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .run('tourist_1', 'Test Tourist', 'tourist@test.com', hashedUserPass, 'tourist', 'https://github.com/shadcn.png', 'Mumbai', 'Love traveling!', 'Mumbai');

        await db.prepare('INSERT INTO users (id, name, email, password, role, avatar, location, bio, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .run('admin_pranay', 'Pranay Admin', 'adminpranay@gmail.com', hashedAdminPass, 'tourist', 'https://github.com/shadcn.png', 'Mumbai', 'Administrator', 'Mumbai');

        res.json({ success: true, message: "Database seeded successfully" });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// AI Translation Helper
const translateText = async (text: string, targetLang: string) => {
    const translated = await translateWithAI(text, targetLang);
    if (translated) return translated;
    return `${targetLang.toUpperCase()}: ${text}`; // Minimal fallback
};

// AI Chat Simulation Helper
const generateAIResponseForGuide = async (userText: string, guideId: string) => {
    const guide = await db.prepare('SELECT * FROM guides WHERE id = ?').get(guideId) as any;
    const specialties = guide ? JSON.parse(guide.specialties || '[]').join(", ") : "";
    const context = `You are ${guide?.name || 'a local guide'} in ${guide?.location || 'India'}. Specialties: ${specialties}. Tone: friendly/concise.`;
    const aiResponse = await generateAIResponse(userText, context);
    return aiResponse || "Hello! I am excited to help you explore. How can I assist you today?";
};

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            const { senderId, receiverId, text, roomId } = data;
            if (!senderId || !receiverId || !text || !roomId) return;

            const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date().toISOString();

            // 1. Check Recipient Preference
            const recipient = await db.prepare('SELECT languages FROM users WHERE id = ?').get(receiverId) as any;
            let targetLang = 'en';
            if (recipient && recipient.languages) {
                try {
                    const langs = JSON.parse(recipient.languages);
                    if (langs.length > 0) targetLang = langs[0].toLowerCase().substring(0, 2);
                } catch { }
            }

            // 2. AI Translation
            const translatedText = await translateText(text, targetLang);

            // 3. Persist
            await db.prepare('INSERT INTO messages (id, sender_id, receiver_id, text, timestamp, is_read, translated_text) VALUES (?, ?, ?, ?, ?, 0, ?)')
                .run(id, senderId, receiverId, text, timestamp, translatedText);

            // 4. Broadcast
            const fullMessage = { ...data, id, timestamp, isRead: false, translatedText };
            io.to(roomId).emit('receive_message', fullMessage);

            // 5. AI Response Logic
            const receiverIsGuide = await db.prepare('SELECT id FROM guides WHERE id = ?').get(receiverId);

            if (receiverIsGuide) {
                setTimeout(() => {
                    io.to(roomId).emit('typing_start', { roomId });
                    setTimeout(async () => {
                        const aiResponseText = await generateAIResponseForGuide(text, receiverId);
                        const aiMsgId = `msg_ai_${Date.now()}`;
                        const aiTimestamp = new Date().toISOString();

                        await db.prepare('INSERT INTO messages (id, sender_id, receiver_id, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, 0)')
                            .run(aiMsgId, receiverId, senderId, aiResponseText, aiTimestamp);

                        io.to(roomId).emit('after_message', {
                            id: aiMsgId,
                            senderId: receiverId,
                            receiverId: senderId,
                            text: aiResponseText,
                            timestamp: aiTimestamp,
                            isRead: false,
                            roomId
                        });
                        io.to(roomId).emit('receive_message', {
                            id: aiMsgId,
                            senderId: receiverId,
                            receiverId: senderId,
                            text: aiResponseText,
                            timestamp: aiTimestamp,
                            isRead: false,
                            roomId
                        });
                        io.to(roomId).emit('typing_stop', { roomId });
                    }, 2000);
                }, 1000);
            }
        } catch (err) {
            console.error("Failed to process message", err);
        }
    });

    socket.on('typing_start', (data) => {
        socket.to(data.roomId).emit('typing_start', data);
    });

    socket.on('typing_stop', (data) => {
        socket.to(data.roomId).emit('typing_stop', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start Server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Socket.io initialized');
});
