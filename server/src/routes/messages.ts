import express from 'express';
import db from '../db';

const router = express.Router();

// GET /api/messages?userId=...&contactId=...
router.get('/', async (req, res) => {
    try {
        const { userId, contactId } = req.query;

        if (!userId || !contactId) {
            res.status(400).json({ error: 'userId and contactId are required' });
            return;
        }

        const query = `
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC
        `;

        const messages = await db.prepare(query).all(userId, contactId, contactId, userId);

        const formatted = messages.map((m: any) => ({
            id: m.id,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            text: m.text,
            timestamp: m.timestamp,
            isRead: !!m.is_read
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// GET /api/messages/conversations/:userId
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const query = `
            WITH LastMessages AS (
                SELECT 
                    CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as contact_id,
                    text,
                    timestamp,
                    ROW_NUMBER() OVER (PARTITION BY (CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END) ORDER BY timestamp DESC) as rn
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
            ),
            UnreadCounts AS (
                SELECT sender_id as contact_id, COUNT(*) as count
                FROM messages
                WHERE receiver_id = ? AND is_read = 0
                GROUP BY sender_id
            )
            SELECT 
                lm.contact_id,
                COALESCE(u.name, g.name) as contact_name,
                COALESCE(u.avatar, g.avatar) as contact_avatar,
                lm.text as last_message,
                lm.timestamp,
                COALESCE(uc.count, 0) as unread_count
            FROM LastMessages lm
            LEFT JOIN users u ON lm.contact_id = u.id
            LEFT JOIN guides g ON lm.contact_id = g.id
            LEFT JOIN UnreadCounts uc ON lm.contact_id = uc.contact_id
            WHERE lm.rn = 1
            ORDER BY lm.timestamp DESC
        `;

        const rows = await db.prepare(query).all(userId, userId, userId, userId, userId);

        const formatted = rows.map((r: any) => ({
            id: r.contact_id,
            name: r.contact_name,
            avatar: r.contact_avatar,
            lastMessage: r.last_message,
            timestamp: r.timestamp,
            unreadCount: r.unread_count
        }));

        res.json(formatted);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// PATCH /api/messages/read
router.patch('/read', async (req, res) => {
    try {
        const { userId, contactId } = req.body;
        if (!userId || !contactId) {
            res.status(400).json({ error: 'userId and contactId are required' });
            return;
        }

        await db.prepare('UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?').run(userId, contactId);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

// POST /api/messages
router.post('/', (req, res) => {
    res.status(501).json({ error: 'Use Socket.io' });
});

export default router;
