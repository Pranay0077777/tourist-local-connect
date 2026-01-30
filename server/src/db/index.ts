import Database from 'better-sqlite3';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const isPostgres = !!process.env.DATABASE_URL;

class DB {
    private sqlite: any;
    private pgPool: Pool | null = null;

    constructor() {
        if (isPostgres) {
            console.log("DB: Using PostgreSQL (Production Mode)");
            this.pgPool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false } // Required for Neon/Supabase
            });
        } else {
            console.log("DB: Using SQLite (Local Dev Mode)");
            const dbPath = path.resolve(__dirname, '../../database.sqlite');
            this.sqlite = new Database(dbPath);
            this.sqlite.pragma('foreign_keys = ON');

            // Initialize Schema if SQLite
            const schemaPath = path.resolve(__dirname, 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf-8');
                this.sqlite.exec(schema);
            }
        }
    }

    // Helper to convert named params (:id) or (?) to Postgres ($1, $2)
    private formatQuery(sql: string) {
        if (!isPostgres) return sql;

        let index = 1;
        // Simple regex to replace ? with $n - might need refinement for complex cases
        return sql.replace(/\?/g, () => `$${index++}`);
    }

    async query(sql: string, params: any[] = []): Promise<any[]> {
        if (isPostgres) {
            const res = await this.pgPool!.query(this.formatQuery(sql), params);
            return res.rows;
        } else {
            return this.sqlite.prepare(sql).all(...params);
        }
    }

    async queryOne(sql: string, params: any[] = []): Promise<any> {
        if (isPostgres) {
            const res = await this.pgPool!.query(this.formatQuery(sql), params);
            return res.rows[0] || null;
        } else {
            return this.sqlite.prepare(sql).get(...params) || null;
        }
    }

    async exec(sql: string, params: any[] = []): Promise<any> {
        if (isPostgres) {
            const res = await this.pgPool!.query(this.formatQuery(sql), params);
            return { changes: res.rowCount };
        } else {
            return this.sqlite.prepare(sql).run(...params);
        }
    }

    // Backward compatibility layer for "prepare" if we want to minimize refactoring
    // But it's better to refactor to query/queryOne/exec for async support.
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
