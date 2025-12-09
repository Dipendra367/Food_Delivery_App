const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/reviews - Create a review
router.post('/', auth, async (req, res) => {
    try {
        const { restaurantId, productId, rating, comment } = req.body;

        // Validate restaurant exists
        const restaurant = await User.findById(restaurantId);
        if (!restaurant || restaurant.role !== 'restaurant') {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Create review
        const review = new Review({
            userId: req.user.userId,
            restaurantId,
            productId, // Optional
            rating,
            comment
        });

        await review.save();

        // Update restaurant average rating
        const stats = await Review.aggregate([
            { $match: { restaurantId: review.restaurantId } },
            {
                $group: {
                    _id: '$restaurantId',
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            restaurant.restaurantDetails.rating = Math.round(stats[0].avgRating * 10) / 10;
            restaurant.restaurantDetails.totalReviews = stats[0].count;
            await restaurant.save();
        }

        res.status(201).json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/reviews/restaurant/:restaurantId - Get reviews for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const reviews = await Review.find({ restaurantId: req.params.restaurantId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name')
            .populate('productId', 'name');

        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name');

        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
