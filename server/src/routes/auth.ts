import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await db.queryOne('SELECT * FROM users WHERE email = ?', [email]);

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
                process.env.JWT_SECRET || 'college_project_secret_key_2026',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: userInfo
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error: any) {
        console.error("Login error:", error);
        if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo')) {
            res.status(503).json({ error: "Database connection issue. Please check your internet or try again in a moment." });
        } else {
            res.status(500).json({ error: "Internal server error. Please try again." });
        }
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, phone, city, aadharNumber, hourlyRate, languages, specializations, dob } = req.body;

        // Run hashing and email check in parallel to save time
        const [existing, hashedPassword] = await Promise.all([
            db.queryOne('SELECT id FROM users WHERE email = ?', [email]),
            bcrypt.hash(password, 8) // Reduced to 8 rounds for "instant" feel during presentation
        ]);

        if (existing) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const id = role === 'guide' ? `g_${Date.now()}` : `u_${Date.now()}`;

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
        await db.exec(`
            INSERT INTO users (id, name, email, password, role, avatar, bio, location, phone, city, aadhar_number, dob, languages, specializations, hourly_rate) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, name, email, hashedPassword, role, avatar, bio, location, safePhone, safeCity, safeAadhar, safeDob, safeLanguages, safeSpecs, safeRate]);

        const langArray = languages ? (typeof languages === 'string' ? languages.split(',').map((l: string) => l.trim()) : languages) : [];
        const specArray = specializations ? (typeof specializations === 'string' ? specializations.split(',').map((s: string) => s.trim()) : specializations) : [];

        // If guide, also insert into guides table for discovery
        if (role === 'guide') {
            await db.exec(`
                INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, dob, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
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
            ]);
        }

        // Generate token for immediate login
        const token = jwt.sign(
            { id, email, role },
            process.env.JWT_SECRET || 'college_project_secret_key_2026',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id,
                name,
                email,
                role,
                phone: safePhone,
                city: safeCity,
                aadhar_number: safeAadhar,
                hourly_rate: safeRate,
                specialties: specArray,
                languages: langArray,
                dob: safeDob,
                avatar,
                bio,
                joinDate: new Date().toISOString()
            }
        });
    } catch (e: any) {
        console.error("Registration error:", e);
        if (e.code === 'ENOTFOUND' || e.message.includes('getaddrinfo')) {
            res.status(503).json({ error: "Database connection issue. Please check your internet or try again." });
        } else {
            res.status(500).json({ error: `Registration failed: ${e.message}` });
        }
    }
});

export default router;
