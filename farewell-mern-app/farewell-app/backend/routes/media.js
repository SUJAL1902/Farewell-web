const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Media = require('../models/Media');
const { verifyAdmin, verifyGuest } = require('../middleware/auth');

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage (files stored permanently in the cloud)
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'farewell',
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'],
  }),
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images and videos are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max (for videos)

// GET all media (guest+)
router.get('/', verifyGuest, async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST upload media (admin only)
router.post('/upload', verifyAdmin, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File is too large. Max allowed size is 50 MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isImage = req.file.mimetype.startsWith('image');
    if (isImage && req.file.size > 10 * 1024 * 1024) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Failed to delete oversized image file:', unlinkErr);
      }
      return res.status(413).json({ message: 'Image too large. Max size is 10 MB.' });
    }

    next();
  });
}, async (req, res) => {
  try {
    const isVideo = req.file.mimetype.startsWith('video');
    const media = await Media.create({
      type: isVideo ? 'video' : 'image',
      filename: req.file.filename,   // Cloudinary public_id
      originalName: req.file.originalname,
      caption: req.body.caption || '',
      url: req.file.path,            // Full Cloudinary HTTPS URL
    });

    res.status(201).json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE media (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Not found' });

    // Delete from Cloudinary
    const resourceType = media.type === 'video' ? 'video' : 'image';
    if (media.filename) {
      await cloudinary.uploader.destroy(media.filename, { resource_type: resourceType });
    }

    await media.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
