import express from 'express';
import multer from 'multer';
import { storage } from '../lib/cloudinary';

const router = express.Router();

// Using Cloudinary storage for production readiness
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB for cloud
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

// Upload Endpoint
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: 'No file uploaded' });
            return;
        }

        // Return the Cloudinary URL (req.file.path contains the secure URL)
        const fileUrl = (req.file as any).path;

        res.json({
            success: true,
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
