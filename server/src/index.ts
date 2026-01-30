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

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Authentication required" });

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, user: any) => {
        if (err) return res.status(403).json({ error: "Invalid or expired token" });
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

        // Insert Mock Guides
        const mockGuides = [
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
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            },
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
            {
                id: "hyd_1",
                name: "Arjun Reddy",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
                location: "Hyderabad, Telangana",
                languages: JSON.stringify(["English", "Telugu", "Hindi"]),
                rating: 4.7,
                review_count: 85,
                hourly_rate: 450,
                specialties: JSON.stringify(["Biryani Tours", "Golkonda Fort", "Heritage Walks"]),
                bio: "Hyderabad is more than just Biryani. Let me take you through the Nizami culture, the bustling bazaars, and the majestic forts.",
                verified: 1,
                response_time: "45 minutes",
                experience: "4 years",
                completed_tours: 110,
                joined_date: "2023-02-20",
                availability: JSON.stringify(["Mon", "Wed", "Fri", "Sat", "Sun"]),
                itinerary: JSON.stringify([]),
                hidden_gems: JSON.stringify([])
            }
        ];

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
