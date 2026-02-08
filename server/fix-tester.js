const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function fixTester() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const email = 'tester@gmail.com';
        const pass = 'password123';
        const hashedPass = await bcrypt.hash(pass, 10);

        // Check if user exists
        const res = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log(`User ${email} not found. Creating...`);
            const id = 'g_tester';
            await pool.query(`
                INSERT INTO users (id, name, email, password, role, avatar, bio, location, city)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [id, 'Tester Guide', email, hashedPass, 'guide', 'https://github.com/shadcn.png', 'Expert tester guide', 'Chennai, Tamil Nadu', 'Chennai']);

            await pool.query(`
                INSERT INTO guides (id, name, avatar, location, languages, rating, review_count, hourly_rate, specialties, bio, verified, response_time, experience, completed_tours, joined_date, availability, itinerary, hidden_gems)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            `, [
                id, 'Tester Guide', 'https://github.com/shadcn.png', 'Chennai, Tamil Nadu',
                JSON.stringify(['English', 'Tamil']), 4.5, 850, 500, JSON.stringify(['Heritage', 'Food']),
                'Expert tester guide', 1, 'within 1 hour', '5 years', 4, '2024-01-01',
                JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]), '[]', '[]'
            ]);
            console.log("Tester user created successfully.");
        } else {
            console.log(`User ${email} exists. Resetting password to password123...`);
            await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPass, email]);
            console.log("Password reset successfully.");
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixTester();
