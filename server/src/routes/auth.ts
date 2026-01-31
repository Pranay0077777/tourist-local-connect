import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

        if (user) {
            // Verify Password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Enforce Role Check
            if (role && user.role !== role) {
                res.status(403).json({ error: `Account registered as ${user.role}. Please login from correct portal.` });
                return;
            }

            // Return user info sans password
            const { password: _, ...userInfo } = user;

            // Generate real JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: userInfo
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/register', async (req, res) => {
    const { email, password, name, role, phone, city, aadharNumber, hourlyRate, languages, specializations, dob } = req.body;

    try {
        const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const id = role === 'guide' ? `g_${Date.now()}` : `u_${Date.now()}`;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Sanitize inputs to avoid undefined errors
        const avatar = req.body.avatar || "/uploads/default-avatar.png";
        const bio = req.body.bio || (role === 'guide' ? "Professional guide" : "New user");
        const location = city ? `${city}, India` : "India";
        const safePhone = phone || null;
        const safeCity = city || null;
        const safeAadhar = aadharNumber || null;
        const safeDob = dob || null;
        const safeLanguages = languages || null;
        const safeSpecs = specializations || null;
        const safeRate = hourlyRate || null;

        // Insert into users table
        await db.prepare(`
            INSERT INTO users (id, name, email, password, role, avatar, bio, location, phone, city, aadhar_number, dob, languages, specializations, hourly_rate) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, name, email, hashedPassword, role, avatar, bio, location, safePhone, safeCity, safeAadhar, safeDob, safeLanguages, safeSpecs, safeRate);

        // If guide, also insert into guides table for discovery
        if (role === 'guide') {
            const langArray = languages ? languages.split(',').map((l: string) => l.trim()) : [];
            const specArray = specializations ? specializations.split(',').map((s: string) => s.trim()) : [];

            await db.prepare(`
                INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, dob, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                id, name, avatar, location,
                JSON.stringify(langArray),
                0, 0, // rating, review_count
                Number(hourlyRate) || 0,
                JSON.stringify(specArray),
                bio, safeDob, 0, // verified
                "1 day", "0 years", 0, // response_time, experience, completed_tours
                new Date().toISOString().split('T')[0], // joined_date
                JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]), // availability
                JSON.stringify([]), JSON.stringify([]) // itinerary, hidden_gems
            );
        }

        // Generate token for immediate login
        const token = jwt.sign(
            { id, email, role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({ success: true, token, user: { id, name, email, role } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: `Registration failed: ${(e as Error).message}` });
    }
});

export default router;
