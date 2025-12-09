const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// GET /api/coupons - Get active coupons (Public)
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            validFrom: { $lte: now },
            validTo: { $gte: now }
        }).select('-usedCount -usageLimit'); // Hide usage stats from public
        res.json(coupons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/coupons/validate - Validate a coupon code
router.post('/validate', async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({ message: 'Coupon is expired or inactive' });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                message: `Minimum order amount of NPR ${coupon.minOrderAmount} required`
            });
        }

        let discount = (orderAmount * coupon.discountPercent) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }

        res.json({
            valid: true,
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            discountAmount: discount,
            message: 'Coupon applied successfully!'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- ADMIN ROUTES ---

// GET /api/coupons/all - Get all coupons (Admin)
router.get('/all', auth, adminAuth, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/coupons - Create coupon (Admin)
router.post('/', auth, adminAuth, async (req, res) => {
    try {
        const { code, description, discountPercent, maxDiscount, minOrderAmount, validFrom, validTo, usageLimit } = req.body;

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code,
            description,
            discountPercent,
            maxDiscount,
            minOrderAmount,
            validFrom,
            validTo,
            usageLimit
        });

        await coupon.save();
        res.status(201).json(coupon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/coupons/:id - Update coupon (Admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/coupons/:id - Delete coupon (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json({ message: 'Coupon deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
