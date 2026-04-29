import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Try Cloudinary first, fall back to local disk
let cloudinaryStorage: any = null;
try {
    const { storage } = require('../lib/cloudinary');
    cloudinaryStorage = storage;
    console.log('Upload: Cloudinary storage configured');
} catch (e) {
    console.warn('Upload: Cloudinary not available, using local disk storage');
}

// Local disk storage as fallback
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'));
};

// Try Cloudinary upload first, fallback to disk
const cloudinaryUpload = cloudinaryStorage ? multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
}) : null;

const diskUpload = multer({
    storage: diskStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
});

// Upload Endpoint
router.post('/', (req, res) => {
    const uploadMiddleware = cloudinaryUpload || diskUpload;

    uploadMiddleware.single('image')(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('Upload error (trying fallback):', err.message);
            
            // If Cloudinary fails, try local disk as fallback
            if (cloudinaryUpload && err.message !== 'Only images are allowed (jpeg, jpg, png, webp, gif)') {
                console.log('Falling back to local disk upload...');
                diskUpload.single('image')(req, res, (diskErr: any) => {
                    if (diskErr) {
                        console.error('Disk upload also failed:', diskErr);
                        return res.status(400).json({ success: false, error: diskErr.message || 'Upload failed' });
                    }
                    
                    if (!req.file) {
                        return res.status(400).json({ success: false, error: 'No file selected' });
                    }

                    const fileUrl = `/uploads/${req.file.filename}`;
                    console.log('File saved locally:', fileUrl);
                    res.json({ success: true, url: fileUrl, filename: req.file.filename });
                });
                return;
            }

            return res.status(400).json({ success: false, error: err.message || 'Check file type and size' });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No file selected' });
            }

            // Cloudinary returns URL in path, disk returns filename
            const fileUrl = (req.file as any).path?.startsWith('http') 
                ? (req.file as any).path 
                : `/uploads/${req.file.filename}`;
            
            console.log('File uploaded:', fileUrl);

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
