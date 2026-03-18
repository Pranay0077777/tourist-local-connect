import express from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Middleware: Verify Admin Access
 * The main `authenticateToken` middleware runs before this router.
 * We just need to check if the user's role is 'admin'.
 */
const verifyAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

router.use(verifyAdmin);

/**
 * GET /api/admin/overview
 * Returns high-level statistics:
 * - totalGuides: count of users with role='guide'
 * - pendingVerifications: count of guides with verified=0
 * - totalTourists: count of users with role='tourist'
 * - monthlyRevenue: Sum of all completed bookings amount
 * - bookingsPerMonth: Chart data
 * - recentApplications: Top 5 newest guide registrations
 */
router.get('/overview', async (req, res) => {
    try {
        const totalGuidesRes = await db.queryOne("SELECT count(*) as count FROM users WHERE role = 'guide'");
        const pendingVerificationsRes = await db.queryOne("SELECT count(*) as count FROM guides WHERE verified = 0 AND id NOT LIKE 'guide_%'");
        const totalTouristsRes = await db.queryOne("SELECT count(*) as count FROM users WHERE role = 'tourist'");
        
        let revenueRes = await db.queryOne("SELECT SUM(total_price) as total FROM bookings WHERE status = 'completed'");
        
        // Mock revenue if 0 for demo purposes based on requirements
        let totalRevenue = revenueRes?.total || 0;
        if(totalRevenue === 0) totalRevenue = 450000; 

        // Get recent applications (guides pending verification, sorted by join limit 5)
        const recentAppRows = await db.query(`
            SELECT u.id, u.name, u.email, u.city, u.avatar, g.joined_date as "joinDate",
                   g.verified, g.languages, g.location 
            FROM users u
            JOIN guides g ON u.id = g.id
            WHERE (u.role = 'guide' OR u.role = 'blocked_guide') AND u.id NOT LIKE 'guide_%'
            ORDER BY g.joined_date DESC LIMIT 5
        `);

        // Format recent applications
        const recentApplications = recentAppRows.map((r: any) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            city: r.city || r.location,
            avatar: r.avatar,
            languages: typeof r.languages === 'string' ? JSON.parse(r.languages || "[]") : r.languages,
            verificationStatus: r.verified === 1 ? 'verified' : 'pending',
            isBlocked: r.role?.startsWith('blocked_'),
            joinDate: r.joinDate
        }));

        // Mock chart Data (Bookings per month) 
        // In a real application, you'd aggregate the `date` column from the bookings table
        const bookingsPerMonth = [
            { month: 'Jan', bookings: 65 }, { month: 'Feb', bookings: 85 },
            { month: 'Mar', bookings: 120 }, { month: 'Apr', bookings: 90 },
            { month: 'May', bookings: 150 }, { month: 'Jun', bookings: 200 }
        ];

        res.json({
            totalGuides: totalGuidesRes?.count || 0,
            pendingVerifications: pendingVerificationsRes?.count || 0,
            totalTourists: totalTouristsRes?.count || 0,
            monthlyRevenue: totalRevenue,
            bookingsPerMonth,
            recentApplications
        });
    } catch (err: any) {
        console.error("Error in /admin/overview:", err);
        res.status(500).json({ error: "Failed to load overview data" });
    }
});

/**
 * GET /api/admin/guides
 * Returns all guides, combining user table and guides table data.
 * Used for Verifications and Contact Guides tabs.
 */
router.get('/guides', async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT u.id, u.name, u.email, u.city, u.avatar, u.aadhar_number as "aadharId", u.dob,
                   g.joined_date as "joinDate", g.verified, g.languages, g.location 
            FROM users u
            JOIN guides g ON u.id = g.id
            WHERE (u.role = 'guide' OR u.role = 'blocked_guide') AND u.id NOT LIKE 'guide_%'
            ORDER BY g.joined_date DESC
        `);

        const guides = rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            city: r.city || r.location,
            avatar: r.avatar,
            languages: typeof r.languages === 'string' ? JSON.parse(r.languages || "[]") : r.languages,
            verificationStatus: r.verified === 1 ? 'verified' : 'pending',
            isBlocked: r.role?.startsWith('blocked_'),
            joinDate: r.joinDate || new Date().toISOString(),
            aadharId: r.aadharId,
            dob: r.dob,
            address: r.location // mapping address to location for now
        }));

        res.json(guides);
    } catch (err: any) {
        console.error("Error in /admin/guides:", err);
        res.status(500).json({ error: "Failed to load guides" });
    }
});

/**
 * PATCH /api/admin/guides/:id/verify
 * Accept/Reject guide application.
 */
router.patch('/guides/:id/verify', async (req, res) => {
    const guideId = req.params.id;
    const { status } = req.body; // 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        // Find guide
        const guide = await db.queryOne("SELECT id FROM guides WHERE id = ?", [guideId]);
        if (!guide) {
            return res.status(404).json({ error: "Guide not found" });
        }

        const isVerified = status === 'verified' ? 1 : 0;
        
        // Update guides table
        await db.exec("UPDATE guides SET verified = ? WHERE id = ?", [isVerified, guideId]);
        
        // Note: For 'rejected', in a real app you might want to remove them from guides table
        // and demote their role back to tourist in the users table, or keep a rejected flag.
        // For this schema, we just set verified = 0.
        
        res.json({ success: true, message: `Guide ${status} successfully.` });
    } catch (err: any) {
        console.error("Error verifying guide:", err);
        res.status(500).json({ error: "Failed to update verification status" });
    }
});

/**
 * GET /api/admin/tourists
 * Returns all users with role 'tourist', along with trip counts.
 */
router.get('/tourists', async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT u.id, u.name, u.email, u.avatar, u.role
            FROM users u
            WHERE (u.role = 'tourist' OR u.role = 'blocked_tourist')
        `);

        // Fetch bookings count per user
        // Using a loop here as sqlite via pg driver can sometimes be tricky with group by joins depending on the wrapper.
        // A single LEFT JOIN query is better, but this is safe for demonstration.
        const tourists = await Promise.all(rows.map(async (r: any) => {
            const tripsRes = await db.queryOne("SELECT count(*) as count FROM bookings WHERE user_id = ?", [r.id]);
            return {
                id: r.id,
                name: r.name,
                email: r.email,
                avatar: r.avatar,
                joinDate: new Date().toISOString(), // User schema missing joined date, mock fallback
                numberOfTrips: tripsRes?.count || 0,
                status: r.role === 'blocked_tourist' ? 'blocked' : 'active'
            };
        }));

        res.json(tourists);
    } catch (err: any) {
        console.error("Error in /admin/tourists:", err);
        res.status(500).json({ error: "Failed to load tourists data" });
    }
});

/**
 * GET /api/admin/bookings
 * Returns booking stats and recent transactions.
 */
router.get('/bookings', async (req, res) => {
    try {
        const totalBookingsRes = await db.queryOne("SELECT count(*) as count FROM bookings");
        const totalRevenueRes = await db.queryOne("SELECT sum(total_price) as total FROM bookings WHERE status = 'completed'");
        
        const totalBookings = totalBookingsRes?.count || 0;
        let totalRevenue = totalRevenueRes?.total || 0;
        if(totalRevenue === 0) totalRevenue = 2500000; // Mock if 0

        const averageTourValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

        // Fetch recent bookings (transactions)
        const recentTxRows = await db.query(`
            SELECT b.id, b.date, b.total_price as amount, b.status, b.tour_type as "tourName",
                   u.name as "touristName", g.name as "guideName"
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN guides g ON b.guide_id = g.id
            ORDER BY b.date DESC LIMIT 10
        `);

        const recentTransactions = recentTxRows.map((tx: any) => {
            let paymentStatus = 'upcoming';
            if (tx.status === 'completed') paymentStatus = 'paid';
            if (tx.status === 'cancelled') paymentStatus = 'refunded';

            return {
                id: tx.id,
                touristName: tx.touristName,
                guideName: tx.guideName,
                tourName: tx.tourName || 'Custom Tour',
                date: tx.date,
                amount: tx.amount,
                paymentStatus
            };
        });

        res.json({
            totalBookings,
            totalRevenue,
            averageTourValue,
            recentTransactions
        });
    } catch (err: any) {
        console.error("Error in /admin/bookings:", err);
        res.status(500).json({ error: "Failed to load bookings data" });
    }
});

/**
 * POST /api/admin/guides/:id/message
 * Sends a message from the system/admin to a guide.
 */
router.post('/guides/:id/message', async (req: any, res) => {
    const guideId = req.params.id;
    const { subject, message } = req.body;
    const adminId = req.user.id; // From authenticateToken middleware

    if (!message) {
        return res.status(400).json({ error: "Message body is required" });
    }

    try {
        // Send a message acting as the admin
        const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const timestamp = new Date().toISOString();
        const fullMessage = `[System: ${subject}] ${message}`;

        await db.exec(
            'INSERT INTO messages (id, sender_id, receiver_id, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, 0)',
            [msgId, adminId, guideId, fullMessage, timestamp]
        );

        // Access io from the request object set in index.ts
        const io = (req as any).io;
        if (io) {
            // Emitting to guide's personal room or broad broadcast based on your socket setup
            // Often rooms are the combined user IDs, but we can emit generically to the receiverId room
            io.to(guideId).emit('receive_message', {
                id: msgId,
                senderId: adminId,
                receiverId: guideId,
                text: fullMessage,
                timestamp,
                isRead: false
            });
        }

        res.json({ success: true, message: "Message sent to guide." });
    } catch (err: any) {
        console.error("Error sending message to guide:", err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

/**
 * PATCH /api/admin/users/:id/block
 * Block or unblock a user/guide
 */
router.patch('/users/:id/block', async (req, res) => {
    const { id } = req.params;
    const { blocked } = req.body;
    try {
        const user = await db.queryOne("SELECT role FROM users WHERE id = ?", [id]);
        if (!user) return res.status(404).json({ error: "User not found" });

        let newRole = user.role;
        if (blocked && !newRole.startsWith('blocked_')) {
            newRole = `blocked_${user.role}`;
        } else if (!blocked && newRole.startsWith('blocked_')) {
            newRole = newRole.replace('blocked_', '');
        }

        await db.exec("UPDATE users SET role = ? WHERE id = ?", [newRole, id]);

        if (blocked && newRole.includes('guide')) {
            await db.exec("UPDATE guides SET verified = 0 WHERE id = ?", [id]);
        }
        res.json({ success: true, message: `User ${blocked ? 'blocked' : 'unblocked'} successfully.` });
    } catch (err) {
        console.error("Error blocking user:", err);
        res.status(500).json({ error: "Failed to update user block status" });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Permanently remove a user/guide and all related data
 */
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Delete related records
        await db.exec("DELETE FROM guides WHERE id = ?", [id]);
        await db.exec("DELETE FROM favorites WHERE user_id = ? OR guide_id = ?", [id, id]);
        await db.exec("DELETE FROM bookings WHERE user_id = ? OR guide_id = ?", [id, id]);
        await db.exec("DELETE FROM reviews WHERE user_id = ? OR guide_id = ?", [id, id]);
        await db.exec("DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?", [id, id]);
        await db.exec("DELETE FROM guide_availability_slots WHERE guide_id = ?", [id]);

        await db.exec("DELETE FROM users WHERE id = ?", [id]);

        res.json({ success: true, message: "User permanently deleted." });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;
