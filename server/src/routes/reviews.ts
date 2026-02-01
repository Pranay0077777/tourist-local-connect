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

        const reviews = await db.query('SELECT * FROM reviews WHERE guide_id = ? ORDER BY date DESC', [guideId]);

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

        const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const date = new Date().toISOString();

        await db.exec(`
            INSERT INTO reviews (id, guide_id, user_name, user_avatar, rating, comment, date, tour_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, guideId, userName, userAvatar, rating, comment, date, tourType || 'Standard Tour']);

        const stats = await db.queryOne(`
            SELECT AVG(rating) as "avgRating", COUNT(*) as count 
            FROM reviews 
            WHERE guide_id = ?
        `, [guideId]);

        if (stats) {
            await db.exec(`
                UPDATE guides 
                SET rating = ?, review_count = ? 
                WHERE id = ?
            `, [Number(Number(stats.avgRating || 0).toFixed(1)), Number(stats.count), guideId]);
        }

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
