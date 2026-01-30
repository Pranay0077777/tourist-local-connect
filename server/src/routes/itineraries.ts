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

        await db.prepare(`
            INSERT INTO saved_itineraries (id, user_id, city, title, content, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, userId, city, title, JSON.stringify(content), createdAt);

        res.json({ success: true, id });
    } catch (error) {
        console.error("Failed to save itinerary:", error);
        res.status(500).json({ error: 'Failed to save itinerary' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const itineraries = await db.prepare('SELECT * FROM saved_itineraries WHERE user_id = ? ORDER BY created_at DESC').all(userId);

        const parsed = itineraries.map((it: any) => ({
            ...it,
            content: JSON.parse(it.content)
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
        await db.prepare('DELETE FROM saved_itineraries WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (error) {
        console.error("Failed to delete itinerary:", error);
        res.status(500).json({ error: 'Failed to delete itinerary' });
    }
});

router.patch('/:id/adjust', async (req, res) => {
    try {
        const { id } = req.params;
        const it = await db.prepare('SELECT * FROM saved_itineraries WHERE id = ?').get(id) as any;
        if (!it) return res.status(404).json({ error: 'Itinerary not found' });

        const content = JSON.parse(it.content);
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
            await db.prepare('UPDATE saved_itineraries SET content = ? WHERE id = ?').run(JSON.stringify(content), id);
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
