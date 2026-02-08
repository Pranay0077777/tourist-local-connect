const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = 'postgresql://neondb_owner:npg_iPjuU9cGWH1p@ep-sweet-band-ahdfnnb7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function test() {
    console.log("Testing connection to:", DATABASE_URL.split('@')[1]);
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("SUCCESS: Connected to DB");
        const res = await client.query('SELECT NOW()');
        console.log("Query result:", res.rows[0]);
        client.release();
    } catch (err) {
        console.error("CONNECTION ERROR:", err.message);
        console.error("FULL ERROR:", err);
    } finally {
        await pool.end();
    }
}

test();
