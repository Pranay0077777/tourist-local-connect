import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

import db from './src/db/index';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    try {
        console.log("Creating default admin user...");
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash('admin123', salt);
        
        // Check if admin exists by ID to prevent duplicate primary key
        const exists = await db.queryOne("SELECT id FROM users WHERE id = 'admin_1'");
        if (exists) {
            console.log("Admin already exists. Updating email to 'admin33@tlc.com' and password to 'admin123'");
            await db.exec("UPDATE users SET email = 'admin33@tlc.com', password = ? WHERE id = 'admin_1'", [hashedPass]);
            console.log("Admin profile updated successfully.");
        } else {
            await db.exec(
                'INSERT INTO users (id, name, email, password, role, avatar, location, bio, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                ['admin_1', 'Super Admin', 'admin33@tlc.com', hashedPass, 'admin', 'https://github.com/shadcn.png', 'System', 'System Administrator', 'System']
            );
            console.log("Admin user created successfully!");
        }
    } catch (err) {
        console.error("Error creating admin:", err);
    } finally {
        process.exit(0);
    }
}

createAdmin();
