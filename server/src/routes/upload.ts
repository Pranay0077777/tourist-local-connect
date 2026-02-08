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
router.post('/', (req, res) => {
    upload.single('image')(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('General upload error:', err);
            return res.status(400).json({ success: false, error: err.message || 'Check file type and size' });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No file selected' });
            }

            // Return the Cloudinary URL (req.file.path contains the secure URL)
            const fileUrl = (req.file as any).path;
            console.log('File uploaded to Cloudinary:', fileUrl);

            res.json({
                success: true,
                url: fileUrl,
                filename: req.file.filename
            });
        } catch (error: any) {
            console.error('Post-processing error:', error);
            res.status(500).json({ success: false, error: 'Failed to process uploaded file' });
        }
    });
});

export default router;
