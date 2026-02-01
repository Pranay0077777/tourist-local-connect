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
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'college_project_secret_key_2026', (err: any, user: any) => {
        if (err) {
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

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// AI Translation Helper
const translateText = async (text: string, targetLang: string) => {
    try {
        const translated = await translateWithAI(text, targetLang);
        if (translated) return translated;
    } catch (e) {
        console.error("AI Translation Error:", e);
    }
    return text; // Return original if translation fails
};

// AI Chat Simulation Helper
const generateAIResponseForGuide = async (userText: string, guideId: string) => {
    try {
        const guide = await db.queryOne('SELECT * FROM guides WHERE id = ?', [guideId]);
        const specialties = guide ? (typeof guide.specialties === 'string' ? JSON.parse(guide.specialties) : guide.specialties).join(", ") : "";
        const context = `You are ${guide?.name || 'a local guide'} in ${guide?.location || 'India'}. Specialties: ${specialties}. Tone: friendly/concise.`;
        const aiResponse = await generateAIResponse(userText, context);
        return aiResponse || "Hello! I am excited to help you explore. How can I assist you today?";
    } catch (e) {
        console.error("AI Response Error:", e);
        return "Hello! I am excited to help you explore. How can I assist you today?";
    }
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

            const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const timestamp = new Date().toISOString();

            // 1. Check Recipient Preference
            const recipient = await db.queryOne('SELECT languages FROM users WHERE id = ?', [receiverId]);
            let targetLang = 'en';
            if (recipient && recipient.languages) {
                try {
                    const langs = typeof recipient.languages === 'string' ? JSON.parse(recipient.languages) : recipient.languages;
                    if (Array.isArray(langs) && langs.length > 0) targetLang = langs[0].toLowerCase().substring(0, 2);
                } catch { }
            }

            // 2. AI Translation
            const translatedText = await translateText(text, targetLang);

            // 3. Persist
            await db.exec('INSERT INTO messages (id, sender_id, receiver_id, text, timestamp, is_read, translated_text) VALUES (?, ?, ?, ?, ?, 0, ?)',
                [id, senderId, receiverId, text, timestamp, translatedText]);

            // 4. Broadcast
            const fullMessage = { ...data, id, timestamp, isRead: false, translatedText };
            io.to(roomId).emit('receive_message', fullMessage);

            // 5. AI Response Logic for Guides
            const receiverIsGuide = await db.queryOne('SELECT id FROM guides WHERE id = ?', [receiverId]);

            if (receiverIsGuide) {
                setTimeout(() => {
                    io.to(roomId).emit('typing_start', { roomId });
                    setTimeout(async () => {
                        const aiResponseText = await generateAIResponseForGuide(text, receiverId);
                        const aiMsgId = `msg_ai_${Date.now()}`;
                        const aiTimestamp = new Date().toISOString();

                        await db.exec('INSERT INTO messages (id, sender_id, receiver_id, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, 0)',
                            [aiMsgId, receiverId, senderId, aiResponseText, aiTimestamp]);

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
