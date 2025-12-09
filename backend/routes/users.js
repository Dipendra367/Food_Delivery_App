const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-passwordHash');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/users/profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const updateData = { name, email };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(password, salt);
        }

        if (req.file) {
            // In production, you'd upload to S3 here. 
            // For MVP, we serve the static file.
            updateData.profileImage = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true }
        ).select('-passwordHash');

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
