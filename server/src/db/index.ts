import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("FATAL: DATABASE_URL is not defined in .env");
    process.exit(1);
}

class DB {
    private pgPool: Pool;

    constructor() {
        console.log("DB: Initializing PostgreSQL...");
        this.pgPool = new Pool({
            connectionString: DATABASE_URL,
            ssl: { rejectUnauthorized: false }, // Required for Neon/Supabase
            max: 20, // Increased for concurrent auth requests
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Test connection
        this.pgPool.connect((err, client, release) => {
            if (err) {
                console.error('DB: Connection Error:', err.stack);
            } else {
                console.log('DB: PostgreSQL Connected Successfully');
                release();
            }
        });
    }

    /**
     * Helper to convert named params (?) to Postgres ($1, $2, ...)
     */
    private formatQuery(sql: string) {
        let index = 1;
        let inQuote = false;
        return sql.split('').map(char => {
            if (char === "'") inQuote = !inQuote;
            if (char === '?' && !inQuote) return `$${index++}`;
            return char;
        }).join('');
    }

    async query(sql: string, params: any[] = []): Promise<any[]> {
        try {
            const res = await this.pgPool.query(this.formatQuery(sql), params);
            return res.rows;
        } catch (error) {
            console.error("DB Query Error:", sql, error);
            throw error;
        }
    }

    async queryOne(sql: string, params: any[] = []): Promise<any> {
        try {
            const res = await this.pgPool.query(this.formatQuery(sql), params);
            return res.rows[0] || null;
        } catch (error) {
            console.error("DB QueryOne Error:", sql, error);
            throw error;
        }
    }

    async exec(sql: string, params: any[] = []): Promise<any> {
        try {
            const res = await this.pgPool.query(this.formatQuery(sql), params);
            return { changes: res.rowCount };
        } catch (error) {
            console.error("DB Exec Error:", sql, error);
            throw error;
        }
    }

    /**
     * Backward compatibility layer for "prepare" syntax.
     */
    prepare(sql: string) {
        const self = this;
        return {
            get: (...params: any[]) => self.queryOne(sql, params),
            all: (...params: any[]) => self.query(sql, params),
            run: (...params: any[]) => self.exec(sql, params)
        };
    }
}

const db = new DB();
export default db;
