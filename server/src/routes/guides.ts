import express from 'express';
import db from '../db';

const router = express.Router();

router.get('/meta', async (req, res) => {
    try {
        // Fetch all distinct locations
        const locations = await db.query('SELECT DISTINCT location FROM guides');
        const cities = Array.from(new Set(locations.map((g: any) => g.location.split(',')[0].trim()))).sort();

        // Fetch all languages and specialties for unique extraction
        // In a large DB, we'd use JSONB functions, but for this size, a quick query is fine
        const data = await db.query('SELECT languages, specialties FROM guides');

        const languages = new Set<string>();
        const specialties = new Set<string>();

        data.forEach((g: any) => {
            const langs = typeof g.languages === 'string' ? JSON.parse(g.languages || '[]') : g.languages;
            const specs = typeof g.specialties === 'string' ? JSON.parse(g.specialties || '[]') : g.specialties;
            if (Array.isArray(langs)) langs.forEach(l => languages.add(l));
            if (Array.isArray(specs)) specs.forEach(s => specialties.add(s));
        });

        res.json({
            cities,
            languages: Array.from(languages).sort(),
            specialties: Array.from(specialties).sort()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch metadata' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { city, minPrice, maxPrice, sort, languages, specialties, query: searchQuery, all: showAll } = req.query;
        let query = 'SELECT * FROM guides';
        const conditions: string[] = [];
        const params: any[] = [];

        // By default, only show verified guides unless 'all=true' is passed (e.g. for admin)
        if (showAll !== 'true') {
            conditions.push('verified = 1');
        }

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

        // Apply sorting directly in SQL
        if (sort === 'price_asc') query += ' ORDER BY hourly_rate ASC';
        else if (sort === 'price_desc') query += ' ORDER BY hourly_rate DESC';
        else if (sort === 'rating_desc') query += ' ORDER BY rating DESC';
        else if (sort === 'reviews_desc') query += ' ORDER BY review_count DESC';
        else query += ' ORDER BY id ASC'; // Consistent ordering

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

        // In-memory filtering for complex JSON arrays (to keep SQL simple/generic)
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

// Consolidated Dashboard Stats Endpoint for "Infinity" Speed
router.get('/:id/dashboard-stats', async (req, res) => {
    try {
        const { id } = req.params;

        // Single-trip database query for all dashboard needs
        const [user, guide, bookings] = await Promise.all([
            db.queryOne('SELECT email FROM users WHERE id = ?', [id]),
            db.queryOne('SELECT rating, review_count FROM guides WHERE id = ?', [id]),
            db.query('SELECT total_price, status FROM bookings WHERE (guide_id = ? OR guideId = ?)', [id, id])
        ]);

        if (!guide) {
            res.status(404).json({ error: 'Guide not found' });
            return;
        }

        const isDemoUser = user && (user.email === 'tester@gmail.com' || user.email === 'guide@test.com' || user.email === 'saipranay6733@gmail.com');

        if (isDemoUser) {
            res.json({
                totalEarnings: 85000,
                completedTours: 4,
                profileViews: 850,
                rating: 4.5
            });
            return;
        }

        const completedTours = bookings.filter((b: any) => b.status === 'completed').length;
        const totalEarnings = bookings
            .filter((b: any) => b.status === 'completed')
            .reduce((acc: number, b: any) => acc + (b.total_price || b.price || 0), 0);

        res.json({
            totalEarnings,
            completedTours,
            profileViews: guide.review_count || 0,
            rating: guide.rating || 0
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Verification Endpoint
router.post('/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const [gInfo, uInfo] = await Promise.all([
            db.prepare('UPDATE guides SET verified = 1 WHERE id = ?').run(id),
            db.prepare('UPDATE users SET aadhar_number = ? WHERE id = ?').run('VERIFIED_USER_GENERIC', id)
        ]);

        if (gInfo.changes > 0 || uInfo.changes > 0) {
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
        const isDemoUser = user && (user.email === 'tester@gmail.com' || user.email === 'guide@test.com' || user.email === 'saipranay6733@gmail.com');

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
