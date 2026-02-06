import db from './index';

async function removeUser() {
    const email = 'vamshithalla@gmail.com';
    console.log(`🔍 Searching for user: ${email}...`);

    try {
        const user = await db.queryOne('SELECT id FROM users WHERE email = ?', [email]);

        if (!user) {
            console.log(`❌ User ${email} not found in database.`);
            return;
        }

        const userId = user.id;
        console.log(`🗑️ Found user with ID: ${userId}. Starting cleanup...`);

        // Tables to clean up
        const queries = [
            ['DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId]],
            ['DELETE FROM bookings WHERE user_id = ? OR guide_id = ?', [userId, userId]],
            ['DELETE FROM reviews WHERE guide_id = ? OR user_id = ?', [userId, userId]],
            ['DELETE FROM favorites WHERE user_id = ? OR guide_id = ?', [userId, userId]],
            ['DELETE FROM posts WHERE user_id = ?', [userId]],
            ['DELETE FROM saved_itineraries WHERE user_id = ?', [userId]],
            ['DELETE FROM guide_availability_slots WHERE guide_id = ?', [userId]],
            ['DELETE FROM guides WHERE id = ?', [userId]],
            ['DELETE FROM users WHERE id = ?', [userId]]
        ];

        for (const [sql, params] of queries) {
            const table = (sql as string).split(' ')[2];
            const result = await db.exec(sql as string, params as any[]);
            console.log(`✅ Removed ${result.changes} from ${table}.`);
        }

        console.log(`✨ Successfully removed all data for ${email}.`);
    } catch (error) {
        console.error('❌ Error during removal:', error);
    }
}

removeUser().then(() => process.exit(0));
