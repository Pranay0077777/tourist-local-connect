import express from 'express';
import db from '../db';

const router = express.Router();

// Get favorites for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const favorites = await db.query('SELECT guide_id FROM favorites WHERE user_id = ?', [userId]);
        const guideIds = favorites.map((f: any) => f.guide_id);
        res.json(guideIds);
    } catch (error: any) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Add a favorite
router.post('/', async (req, res) => {
    try {
        const { userId, guideId } = req.body;
        if (!userId || !guideId) {
            res.status(400).json({ error: 'Missing userId or guideId' });
            return;
        }

        const existing = await db.queryOne('SELECT id FROM favorites WHERE user_id = ? AND guide_id = ?', [userId, guideId]);
        if (existing) {
            res.json({ success: true, message: 'Already favorited' });
            return;
        }

        const id = `fav_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        await db.exec('INSERT INTO favorites (id, user_id, guide_id) VALUES (?, ?, ?)', [id, userId, guideId]);

        res.json({ success: true, id });
    } catch (error: any) {
        console.error('Error adding favorite:', {
            error: error.message,
            stack: error.stack,
            userId: req.body.userId,
            guideId: req.body.guideId
        });
        res.status(500).json({ error: 'Failed to add favorite', details: error.message });
    }
});

// Remove a favorite
router.delete('/:userId/:guideId', async (req, res) => {
    try {
        const { userId, guideId } = req.params;
        await db.exec('DELETE FROM favorites WHERE user_id = ? AND guide_id = ?', [userId, guideId]);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

export default router;
