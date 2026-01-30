import express from 'express';
import db from '../db';

const router = express.Router();

// Initialize table if it doesn't exist (compatibility helper)
const initTable = async () => {
    try {
        await db.exec(`
            CREATE TABLE IF NOT EXISTS guide_availability_slots (
                id TEXT PRIMARY KEY,
                guide_id TEXT,
                date TEXT,
                status TEXT, -- 'available', 'busy', 'off'
                FOREIGN KEY(guide_id) REFERENCES guides(id)
            )
        `);
    } catch (e) {
        console.error("Error creating availability table", e);
    }
};
initTable();

router.get('/:guideId', async (req, res) => {
    try {
        const { guideId } = req.params;
        const slots = await db.prepare('SELECT date, status FROM guide_availability_slots WHERE guide_id = ?').all(guideId);

        const availabilityMap: Record<string, string> = {};
        slots.forEach((slot: any) => {
            availabilityMap[slot.date] = slot.status;
        });

        res.json(availabilityMap);
    } catch (error: any) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/:guideId', async (req, res) => {
    try {
        const { guideId } = req.params;
        const { date, status } = req.body;

        const id = `${guideId}_${date}`;

        await db.prepare(`
            INSERT INTO guide_availability_slots (id, guide_id, date, status)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET status = EXCLUDED.status
        `).run(id, guideId, date, status);

        res.json({ date, status });
    } catch (error: any) {
        console.error('Error updating availability:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
