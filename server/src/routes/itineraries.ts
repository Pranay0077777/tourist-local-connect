import express from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { CITY_DATA } from './ai';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { userId, city, title, content } = req.body;
        const id = uuidv4();
        const createdAt = new Date().toISOString();

        await db.exec(`
            INSERT INTO saved_itineraries (id, user_id, city, title, content, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id, userId, city, title, JSON.stringify(content), createdAt]);

        res.json({ success: true, id });
    } catch (error) {
        console.error("Failed to save itinerary:", error);
        res.status(500).json({ error: 'Failed to save itinerary' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const itineraries = await db.query('SELECT * FROM saved_itineraries WHERE user_id = ? ORDER BY created_at DESC', [userId]);

        const parsed = itineraries.map((it: any) => ({
            ...it,
            content: typeof it.content === 'string' ? JSON.parse(it.content) : it.content
        }));

        res.json(parsed);
    } catch (error) {
        console.error("Failed to fetch itineraries:", error);
        res.status(500).json({ error: 'Failed to fetch itineraries' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.exec('DELETE FROM saved_itineraries WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Failed to delete itinerary:", error);
        res.status(500).json({ error: 'Failed to delete itinerary' });
    }
});

router.patch('/:id/adjust', async (req, res) => {
    try {
        const { id } = req.params;
        const it = await db.queryOne('SELECT * FROM saved_itineraries WHERE id = ?', [id]);
        if (!it) return res.status(404).json({ error: 'Itinerary not found' });

        const content = typeof it.content === 'string' ? JSON.parse(it.content) : it.content;
        const cityData = CITY_DATA[it.city];

        if (!cityData || !content.stops) {
            return res.json({ success: true, message: 'No adjustment needed' });
        }

        const indoorPool = [...cityData.morning, ...cityData.evening].filter(p => p.category === 'culture' || p.category === 'history' || p.category === 'food');

        let adjusted = false;
        const newStops = content.stops.map((stop: any) => {
            if (stop.category === 'nature' || stop.category === 'market') {
                const replacement = indoorPool.find(p => !content.stops.some((s: any) => s.name === p.name));
                if (replacement) {
                    adjusted = true;
                    content.itinerary = content.itinerary.replace(stop.name, `**${replacement.name}** (Indoor Alternative)`);
                    return { ...replacement };
                }
            }
            return stop;
        });

        if (adjusted) {
            content.stops = newStops;
            await db.exec('UPDATE saved_itineraries SET content = ? WHERE id = ?', [JSON.stringify(content), id]);
            res.json({ success: true, message: 'Itinerary adjusted for rain!', itinerary: { ...it, content } });
        } else {
            res.json({ success: true, message: 'No outdoor spots found to adjust.' });
        }

    } catch (error) {
        console.error("Failed to adjust itinerary:", error);
        res.status(500).json({ error: 'Failed to adjust' });
    }
});

export default router;
