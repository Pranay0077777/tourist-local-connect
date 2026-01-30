const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
console.log('Opening DB at:', dbPath);
const db = new Database(dbPath);

const user = db.prepare("SELECT id, name, avatar FROM users WHERE email = ?").get('tourist@test.com'); // Or 'saipranay6733@gmail.com' based on previous logs
const user2 = db.prepare("SELECT id, name, avatar FROM users WHERE email = ?").get('saipranay6733@gmail.com');

console.log('Test User:', user);
console.log('Real User:', user2);
