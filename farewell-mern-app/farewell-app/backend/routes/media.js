const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const Media = require('../models/Media');
const { verifyAdmin, verifyGuest } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary if credentials are present in env
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Local Multer storage for temporary uploads (or permanent if Cloudinary is disabled)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
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
  const tempFilePath = req.file.path;
  try {
    const isVideo = req.file.mimetype.startsWith('video');
    
    let url = `/uploads/${req.file.filename}`;
    let filename = req.file.filename;

    if (useCloudinary) {
      const uploadOpts = {
        resource_type: isVideo ? 'video' : 'image',
        folder: 'farewell2226',
      };
      
      const result = await cloudinary.uploader.upload(tempFilePath, uploadOpts);
      url = result.secure_url;
      filename = result.public_id;

      // Delete the temporary file from local disk
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkErr) {
        console.error('Failed to delete temporary local file after Cloudinary upload:', unlinkErr);
      }
    }

    const media = await Media.create({
      type: isVideo ? 'video' : 'image',
      filename,
      originalName: req.file.originalname,
      caption: req.body.caption || '',
      url,
    });

    res.status(201).json(media);
  } catch (err) {
    // If saving/uploading failed, clean up local temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkErr) {
        console.error('Failed to delete temp file on upload error:', unlinkErr);
      }
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE media (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Not found' });

    const isCloudinary = media.url.startsWith('http') && useCloudinary;
    if (isCloudinary) {
      const resourceType = media.type === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(media.filename, { resource_type: resourceType });
    } else {
      // Local storage cleanup
      const filePath = path.join(__dirname, '../uploads', media.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await media.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
