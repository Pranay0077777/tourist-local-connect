import express from 'express';
import db from '../db';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { city, minPrice, maxPrice, sort, languages, specialties, query: searchQuery } = req.query;
        let query = 'SELECT * FROM guides';
        const conditions: string[] = [];
        const params: any[] = [];

        if (city && city !== 'null' && city !== 'undefined' && city !== '') {
            conditions.push('LOWER(location) LIKE LOWER(?)');
            params.push(`%${city}%`);
        }

        if (searchQuery) {
            conditions.push('(LOWER(name) LIKE LOWER(?) OR LOWER(specialties) LIKE LOWER(?) OR LOWER(bio) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?))');
            params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
        }

        if (minPrice) {
            conditions.push('hourly_rate >= ?');
            params.push(Number(minPrice));
        }

        if (maxPrice) {
            conditions.push('hourly_rate <= ?');
            params.push(Number(maxPrice));
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        if (sort === 'price_asc') query += ' ORDER BY hourly_rate ASC';
        if (sort === 'price_desc') query += ' ORDER BY hourly_rate DESC';
        if (sort === 'rating_desc') query += ' ORDER BY rating DESC';
        if (sort === 'reviews_desc') query += ' ORDER BY review_count DESC';

        const guides = await db.query(query, params);

        let parsedGuides = guides.map((g: any) => ({
            id: g.id,
            name: g.name,
            avatar: g.avatar,
            location: g.location,
            languages: typeof g.languages === 'string' ? JSON.parse(g.languages || '[]') : g.languages,
            rating: g.rating,
            reviewCount: g.review_count,
            hourlyRate: g.hourly_rate,
            specialties: typeof g.specialties === 'string' ? JSON.parse(g.specialties || '[]') : g.specialties,
            bio: g.bio,
            verified: !!g.verified,
            responseTime: g.response_time,
            experience: g.experience,
            completedTours: g.completed_tours,
            joinedDate: g.joined_date,
            availability: typeof g.availability === 'string' ? JSON.parse(g.availability || '[]') : g.availability,
            itinerary: typeof g.itinerary === 'string' ? JSON.parse(g.itinerary || '[]') : g.itinerary,
            hiddenGems: typeof g.hidden_gems === 'string' ? JSON.parse(g.hidden_gems || '[]') : g.hidden_gems
        }));

        if (languages) {
            const langList = Array.isArray(languages) ? languages : [languages];
            parsedGuides = parsedGuides.filter((g: any) =>
                langList.every((l: any) => g.languages.includes(l))
            );
        }

        if (specialties) {
            const specList = Array.isArray(specialties) ? specialties : [specialties];
            parsedGuides = parsedGuides.filter((g: any) =>
                specList.every((s: any) => g.specialties.includes(s))
            );
        }

        res.json(parsedGuides);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch guides' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const guide = await db.queryOne('SELECT * FROM guides WHERE id = ?', [req.params.id]);
        if (guide) {
            res.json({
                id: guide.id,
                name: guide.name,
                avatar: guide.avatar,
                location: guide.location,
                languages: typeof guide.languages === 'string' ? JSON.parse(guide.languages || '[]') : guide.languages,
                rating: guide.rating,
                reviewCount: guide.review_count,
                hourlyRate: guide.hourly_rate,
                specialties: typeof guide.specialties === 'string' ? JSON.parse(guide.specialties || '[]') : guide.specialties,
                bio: guide.bio,
                verified: !!guide.verified,
                responseTime: guide.response_time,
                experience: guide.experience,
                completedTours: guide.completed_tours,
                joinedDate: guide.joined_date,
                availability: typeof guide.availability === 'string' ? JSON.parse(guide.availability || '[]') : guide.availability,
                itinerary: typeof guide.itinerary === 'string' ? JSON.parse(guide.itinerary || '[]') : guide.itinerary,
                hiddenGems: typeof guide.hidden_gems === 'string' ? JSON.parse(guide.hidden_gems || '[]') : guide.hidden_gems
            });
        } else {
            res.status(404).json({ error: 'Guide not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch guide' });
    }
});

// Verification Endpoint
router.post('/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const info = await db.prepare('UPDATE guides SET verified = 1 WHERE id = ?').run(id);

        if (info.changes > 0) {
            res.json({ success: true, verified: true });
        } else {
            res.status(404).json({ error: 'Guide not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Earnings Endpoint (Mock Data)
router.get('/:id/earnings', async (req, res) => {
    try {
        const { id } = req.params;
        const { period } = req.query;

        let data;
        let summary = {
            today: 0,
            yesterday: 0,
            thisWeek: 0,
            total: 0
        };

        const user = await db.prepare('SELECT email FROM users WHERE id = ?').get(id) as any;
        const isDemoUser = user && (user.email === 'guide@test.com' || user.email === 'saipranay6733@gmail.com');

        if (isDemoUser) {
            if (period === 'daily') {
                data = [
                    { name: '9 AM', value: 0 },
                    { name: '10 AM', value: 500 },
                    { name: '11 AM', value: 0 },
                    { name: '12 PM', value: 750 },
                    { name: '1 PM', value: 0 },
                    { name: '2 PM', value: 0 },
                    { name: '3 PM', value: 500 },
                    { name: '4 PM', value: 1200 },
                    { name: '5 PM', value: 0 },
                ];
                summary = { today: 2950, yesterday: 1800, thisWeek: 15400, total: 85000 };
            } else if (period === 'weekly') {
                data = [
                    { name: 'Mon', value: 1200 },
                    { name: 'Tue', value: 1800 },
                    { name: 'Wed', value: 1500 },
                    { name: 'Thu', value: 2200 },
                    { name: 'Fri', value: 2400 },
                    { name: 'Sat', value: 3500 },
                    { name: 'Sun', value: 2800 },
                ];
                summary = { today: 2900, yesterday: 3200, thisWeek: 15400, total: 85000 };
            } else {
                data = [
                    { name: 'Week 1', value: 18000 },
                    { name: 'Week 2', value: 22000 },
                    { name: 'Week 3', value: 19500 },
                    { name: 'Week 4', value: 25500 },
                ];
                summary = { today: 0, yesterday: 0, thisWeek: 0, total: 85000 };
            }
        }

        res.json({
            graph: data,
            summary
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch earnings' });
    }
});

export default router;
