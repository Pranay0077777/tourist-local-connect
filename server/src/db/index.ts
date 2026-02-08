import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

// DATABASE_URL check removed from top-level to prevent Vercel runtime crashes.
// The DB constructor now handles missing credentials gracefully.

class DB {
    private pgPool: Pool;

    constructor() {
        console.log("DB: Initializing PostgreSQL...");

        const isProduction = process.env.NODE_ENV === 'production' || DATABASE_URL?.includes('render.com') || DATABASE_URL?.includes('supabase.co') || DATABASE_URL?.includes('neon.tech');

        this.pgPool = new Pool({
            connectionString: DATABASE_URL,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 15000, // Increased for cloud wake-up
        });

        // Test connection with retry logic
        this.verifyConnection();
    }

    private async verifyConnection(retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const client = await this.pgPool.connect();
                console.log('DB: PostgreSQL Connected Successfully');
                client.release();
                return;
            } catch (err: any) {
                console.error(`DB: Connection Attempt ${i + 1} Failed:`, err.message);
                if (i === retries - 1) {
                    console.error('DB: Final Connection Failure. Check DATABASE_URL and Internet.');
                } else {
                    await new Promise(res => setTimeout(res, 2000)); // Wait before retry
                }
            }
        }
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
        } catch (error: any) {
            console.error("DB Query Error:", { sql, error: error.message });
            // If connection lost, try to verify
            if (error.message.includes('connection') || error.message.includes('terminated')) {
                this.verifyConnection();
            }
            throw error;
        }
    }

    async queryOne(sql: string, params: any[] = []): Promise<any> {
        try {
            const res = await this.pgPool.query(this.formatQuery(sql), params);
            return res.rows[0] || null;
        } catch (error: any) {
            console.error("DB QueryOne Error:", { sql, error: error.message });
            if (error.message.includes('connection') || error.message.includes('terminated')) {
                this.verifyConnection();
            }
            throw error;
        }
    }

    async exec(sql: string, params: any[] = []): Promise<any> {
        try {
            const res = await this.pgPool.query(this.formatQuery(sql), params);
            return { changes: res.rowCount };
        } catch (error: any) {
            console.error("DB Exec Error:", { sql, error: error.message });
            if (error.message.includes('connection') || error.message.includes('terminated')) {
                this.verifyConnection();
            }
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
