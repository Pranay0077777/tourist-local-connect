import express from 'express';
import db from '../db';

const router = express.Router();

// PATCH /api/users/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Allowed fields to update
        const allowed = ['name', 'phone', 'city', 'bio', 'avatar', 'preferences', 'favorites', 'hourly_rate', 'languages', 'specializations', 'dob', 'location', 'aadhar_number'];
        const keys = Object.keys(updates).filter(k => allowed.includes(k));

        if (keys.length === 0) {
            res.json({ message: 'No valid updates provided' });
            return;
        }

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => {
            if (typeof updates[k] === 'object') return JSON.stringify(updates[k]);
            return updates[k];
        });

        // Add ID to end
        values.push(id);

        const info = await db.exec(`UPDATE users SET ${setClause} WHERE id = ?`, values);

        // SYNC WITH GUIDES TABLE
        const guideFields = ['name', 'avatar', 'location', 'bio', 'hourly_rate', 'specialties', 'languages', 'experience'];
        const gKeys = Object.keys(updates).filter(k => guideFields.includes(k) || (k === 'city' && guideFields.includes('location')));

        if (gKeys.length > 0) {
            const gUpdates = gKeys.map(k => {
                const key = k === 'city' ? 'location' : k;
                let val = updates[k];
                if (Array.isArray(val)) val = JSON.stringify(val);
                return { key, val };
            });

            const gSetClause = gUpdates.map(u => `${u.key} = ?`).join(', ');
            const gValues = gUpdates.map(u => u.val);
            gValues.push(id);

            try {
                await db.exec(`UPDATE guides SET ${gSetClause} WHERE id = ?`, gValues);
            } catch (e) {
                // Ignore if not a guide
            }
        }

        if (info.changes > 0) {
            // Fetch updated
            const user = await db.queryOne('SELECT * FROM users WHERE id = ?', [id]);
            res.json({ success: true, user });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error("Failed to update user:", error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// GET /api/users/:id (Helper)
router.get('/:id', async (req, res) => {
    try {
        const user = await db.queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (user) res.json(user);
        else res.status(404).json({ error: 'User not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
