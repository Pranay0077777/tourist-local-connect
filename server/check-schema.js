const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = 'postgresql://neondb_owner:npg_iPjuU9cGWH1p@ep-sweet-band-ahdfnnb7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkSchema() {
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("Connected. Checking tables...");

        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Existing Tables:", tables.rows.map(r => r.table_name));

        for (const table of ['users', 'guides', 'favorites', 'saved_itineraries']) {
            try {
                const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`Table ${table} row count:`, count.rows[0].count);
            } catch (e) {
                console.log(`Table ${table} check failed:`, e.message);
            }
        }

        client.release();
    } catch (err) {
        console.error("ERROR:", err.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
