import express from 'express';
import db from '../db';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { guideId } = req.query;
        if (!guideId) {
            res.status(400).json({ error: "Missing guideId" });
            return;
        }

        const reviews = await db.prepare('SELECT * FROM reviews WHERE guide_id = ? ORDER BY date DESC').all(guideId);

        const formattedReviews = reviews.map((r: any) => ({
            id: r.id,
            guideId: r.guide_id,
            userName: r.user_name,
            userAvatar: r.user_avatar,
            rating: r.rating,
            comment: r.comment,
            date: r.date,
            tourType: r.tour_type
        }));

        res.json(formattedReviews);
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { guideId, userName, userAvatar, rating, comment, tourType } = req.body;

        if (!guideId || !rating || !comment) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const id = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const date = new Date().toISOString();

        await db.prepare(`
            INSERT INTO reviews (id, guide_id, user_name, user_avatar, rating, comment, date, tour_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, guideId, userName, userAvatar, rating, comment, date, tourType || 'Standard Tour');

        const stats = await db.prepare(`
            SELECT AVG(rating) as avgRating, COUNT(*) as count 
            FROM reviews 
            WHERE guide_id = ?
        `).get(guideId) as { avgRating: number, count: number };

        await db.prepare(`
            UPDATE guides 
            SET rating = ?, review_count = ? 
            WHERE id = ?
        `).run(Number(stats.avgRating.toFixed(1)), stats.count, guideId);

        res.status(201).json({
            id,
            guideId,
            userName,
            userAvatar,
            rating,
            comment,
            date,
            tourType: tourType || 'Standard Tour'
        });

    } catch (error: any) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
