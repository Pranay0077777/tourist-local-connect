import db from './server/src/db/index';

async function check() {
    try {
        const users = await db.query('SELECT email, role FROM users');
        console.log("Registered Users:");
        console.table(users);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
