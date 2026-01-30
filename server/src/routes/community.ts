import express from 'express';
import db from '../db';

const router = express.Router();

// GET /api/community/posts?city=Chennai
router.get('/posts', async (req, res) => {
    try {
        const { city } = req.query;
        let query = 'SELECT * FROM posts ORDER BY created_at DESC';
        const params: any[] = [];

        if (city && typeof city === 'string') {
            query = 'SELECT * FROM posts WHERE city LIKE ? ORDER BY created_at DESC';
            params.push(`%${city}%`);
        }

        const posts = await db.prepare(query).all(...params);

        const parsedPosts = posts.map((p: any) => ({
            ...p,
            comments: JSON.parse(p.comments || '[]')
        }));

        res.json(parsedPosts);
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// POST /api/community/posts
router.post('/posts', async (req, res) => {
    try {
        const { userId, userName, userAvatar, content, image, city } = req.body;
        const id = `post_${Date.now()}`;
        const createdAt = new Date().toISOString();

        await db.prepare(`
            INSERT INTO posts (id, user_id, user_name, user_avatar, content, image, city, likes, comments, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, '[]', ?)
        `).run(id, userId, userName, userAvatar, content, image, city || '', createdAt);

        res.json({ success: true, id, message: 'Post created' });
    } catch (error) {
        console.error("Failed to create post:", error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        await db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// POST /api/community/posts/:id/view
router.post('/posts/:id/view', async (req, res) => {
    try {
        const { id } = req.params;
        await db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to increment view' });
    }
});

// POST /api/community/posts/:id/comment
router.post('/posts/:id/comment', async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, text } = req.body;

        const post = await db.prepare('SELECT comments FROM posts WHERE id = ?').get(id) as any;
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comments = JSON.parse(post.comments || '[]');
        const newComment = {
            id: Date.now().toString(),
            userName,
            text,
            timestamp: new Date().toISOString()
        };
        comments.push(newComment);

        await db.prepare('UPDATE posts SET comments = ? WHERE id = ?').run(JSON.stringify(comments), id);

        res.json({ success: true, comments, newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to comment' });
    }
});

// DELETE /api/community/posts/:id/comments/:commentId
router.delete('/posts/:id/comments/:commentId', async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const post = await db.prepare('SELECT comments FROM posts WHERE id = ?').get(id) as any;
        if (!post) return res.status(404).json({ error: 'Post not found' });

        let comments = JSON.parse(post.comments || '[]');
        comments = comments.filter((c: any) => c.id !== commentId);

        await db.prepare('UPDATE posts SET comments = ? WHERE id = ?').run(JSON.stringify(comments), id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

export default router;
