import express from 'express';
import db from '../db';

const router = express.Router();

// GET /api/bookings?userId=...&role=...
router.get('/', async (req, res) => {
    try {
        const { userId, role } = req.query;

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        let query = 'SELECT b.*, g.name as guideName, g.avatar as guideAvatar, u.name as userName, u.avatar as userAvatar FROM bookings b LEFT JOIN guides g ON b.guide_id = g.id LEFT JOIN users u ON b.user_id = u.id';

        if (role === 'guide') {
            query += ' WHERE b.guide_id = ?';
        } else {
            query += ' WHERE b.user_id = ?';
        }

        const bookings = await db.prepare(query).all(userId);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// POST /api/bookings
router.post('/', async (req: any, res) => {
    try {
        const { guideId, userId, date, time, price, guests, tourType } = req.body;

        if (!guideId || !date || !price) {
            res.status(400).json({ error: 'Missing required fields (guideId, date, price)' });
            return;
        }

        const id = `bk_${Date.now()}`;
        const status = 'pending';
        // Use provided userId or fallback to guest
        const effectiveUserId = userId || `guest_${Math.random().toString(36).substring(7)}`;

        await db.prepare('INSERT INTO bookings (id, guide_id, user_id, date, time, status, total_price, guests, tour_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .run(id, guideId, effectiveUserId, date, time || '10:00 AM', status, price, guests || 1, tourType || 'Custom Tour');

        const booking = {
            id,
            guide_id: guideId,
            user_id: effectiveUserId,
            date,
            time: time || '10:00 AM',
            status,
            total_price: price,
            guests: guests || 1,
            tour_type: tourType || 'Custom Tour'
        };

        // Emit real-time event
        if (req.io) {
            req.io.emit('booking_created', booking);
        }

        res.json({ id, status, message: 'Booking requested successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// PATCH /api/bookings/:id (Cancel/Update Status)
router.patch('/:id', async (req: any, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const info = await db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);

        if (info.changes > 0) {
            // Fetch updated booking
            const updatedBooking = await db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as any;

            // SMART AVAILABILITY: If confirmed, mark that date as BUSY for the guide
            if (status === 'confirmed' && updatedBooking) {
                try {
                    const { guide_id, date } = updatedBooking;
                    const slotId = `${guide_id}_${date}`;
                    await db.prepare(`
                        INSERT INTO guide_availability_slots (id, guide_id, date, status)
                        VALUES (?, ?, ?, 'busy')
                        ON CONFLICT(id) DO UPDATE SET status = 'busy'
                    `).run(slotId, guide_id, date);
                    console.log(`Smart Availability: Marked ${date} as busy for guide ${guide_id}`);
                } catch (e) {
                    console.error("Failed to update availability slot", e);
                }
            }

            if (req.io) {
                req.io.emit('booking_updated', updatedBooking);
            }

            res.json({ success: true, status });
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

export default router;
