const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const restaurantAuth = require('../middleware/restaurantAuth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// GET /api/restaurant/dashboard - Restaurant dashboard stats
router.get('/dashboard', auth, restaurantAuth, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch restaurant details from Restaurant collection
        let restaurant = await Restaurant.findOne({ userId });

        // If no restaurant document exists, create one with defaults
        if (!restaurant) {
            restaurant = await Restaurant.create({
                userId,
                restaurantName: req.user.name,
                description: '',
                address: { street: '', city: '', area: '', coordinates: { lat: 27.7172, lng: 85.3240 } },
                phone: '',
                cuisine: [],
                openingHours: [],
                isActive: true,
                isApproved: false
            });
        }

        const restaurantId = restaurant._id;

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get stats using Restaurant document ID
        const [totalProducts, todayOrders, pendingOrders, totalRevenue] = await Promise.all([
            Product.countDocuments({ restaurantId }),
            Order.countDocuments({
                restaurantId,
                createdAt: { $gte: today, $lt: tomorrow }
            }),
            Order.countDocuments({
                restaurantId,
                restaurantStatus: 'pending'
            }),
            Order.aggregate([
                { $match: { restaurantId, paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ])
        ]);

        const revenue = totalRevenue[0]?.total || 0;
        const commission = 15; // Default commission
        const restaurantEarnings = revenue * (1 - commission / 100);

        res.json({
            totalProducts,
            todayOrders,
            pendingOrders,
            totalRevenue: revenue,
            restaurantEarnings,
            commission,
            restaurantInfo: {
                name: restaurant.restaurantName,
                description: restaurant.description,
                address: restaurant.address,
                phone: restaurant.phone,
                cuisine: restaurant.cuisine,
                openingHours: restaurant.openingHours,
                logo: restaurant.logo,
                coverImage: restaurant.coverImage,
                rating: restaurant.rating,
                isActive: restaurant.isActive,
                isApproved: restaurant.isApproved
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/restaurant/orders - Get restaurant's orders
router.get('/orders', auth, restaurantAuth, async (req, res) => {
    try {
        // Find Restaurant document
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });
        if (!restaurant) {
            return res.json([]);
        }

        const { status } = req.query;
        const filter = { restaurantId: restaurant._id };

        if (status) {
            filter.restaurantStatus = status;
        }

        const orders = await Order.find(filter)
            .populate('userId', 'name email')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/restaurant/orders/:id - Update order status
router.put('/orders/:id', auth, restaurantAuth, async (req, res) => {
    try {
        // Find Restaurant document
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const { restaurantStatus, rejectionReason, preparationTime } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            restaurantId: restaurant._id
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.restaurantStatus = restaurantStatus;

        if (rejectionReason) {
            order.rejectionReason = rejectionReason;
        }

        if (preparationTime) {
            order.preparationTime = preparationTime;
        }

        // Update main status based on restaurant status
        if (restaurantStatus === 'accepted') {
            order.status = 'pending';
        } else if (restaurantStatus === 'preparing') {
            order.status = 'preparing';
        } else if (restaurantStatus === 'ready') {
            order.status = 'delivering';
        } else if (restaurantStatus === 'rejected') {
            order.status = 'cancelled';
        }

        await order.save();

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/restaurant/products - Get restaurant's products
router.get('/products', auth, restaurantAuth, async (req, res) => {
    try {
        // First find the Restaurant document for this user
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });

        if (!restaurant) {
            return res.json([]); // Return empty array if no restaurant document exists
        }

        // Query products using the Restaurant document's _id
        const products = await Product.find({ restaurantId: restaurant._id })
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/restaurant/products - Create product
router.post('/products', auth, restaurantAuth, async (req, res) => {
    try {
        // Find Restaurant document
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const productData = {
            ...req.body,
            restaurantId: restaurant._id,
            categories: Array.isArray(req.body.categories) ? req.body.categories : req.body.categories.split(',').map(s => s.trim()),
            tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(s => s.trim())
        };

        const product = new Product(productData);
        await product.save();

        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/restaurant/products/:id - Update product
router.put('/products/:id', auth, restaurantAuth, async (req, res) => {
    try {
        // Find Restaurant document
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            restaurantId: restaurant._id
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updateData = {
            ...req.body,
            categories: Array.isArray(req.body.categories) ? req.body.categories : req.body.categories.split(',').map(s => s.trim()),
            tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(s => s.trim())
        };

        Object.assign(product, updateData);
        await product.save();

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/restaurant/products/:id - Delete product
router.delete('/products/:id', auth, restaurantAuth, async (req, res) => {
    try {
        // Find Restaurant document
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            restaurantId: restaurant._id
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/restaurant/analytics - Get analytics
router.get('/analytics', auth, restaurantAuth, async (req, res) => {
    try {
        // Find Restaurant document
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });
        if (!restaurant) {
            return res.json({ revenueByMonth: [], topProducts: [] });
        }

        const restaurantId = restaurant._id;

        // Revenue by month
        const revenueByMonth = await Order.aggregate([
            { $match: { restaurantId, paymentStatus: 'completed' } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top selling products
        const topProducts = await Order.aggregate([
            { $match: { restaurantId, paymentStatus: 'completed' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    totalSold: { $sum: '$items.qty' },
                    revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);

        // Populate product details
        await Product.populate(topProducts, { path: '_id', select: 'name image' });

        res.json({
            revenueByMonth,
            topProducts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/restaurant/profile - Update restaurant profile
router.put('/profile', auth, restaurantAuth, async (req, res) => {
    try {
        const { restaurantDetails } = req.body;
        const userId = req.user.userId;

        // Find or create restaurant document
        let restaurant = await Restaurant.findOne({ userId });

        if (!restaurant) {
            // Create new restaurant document
            restaurant = new Restaurant({
                userId,
                restaurantName: restaurantDetails.restaurantName || 'New Restaurant',
                description: restaurantDetails.description || '',
                phone: restaurantDetails.phone || '',
                address: restaurantDetails.address || { street: '', city: '', area: '', coordinates: { lat: 27.7172, lng: 85.3240 } },
                cuisine: restaurantDetails.cuisine || [],
                openingHours: restaurantDetails.openingHours || [],
                logo: restaurantDetails.logo || '',
                coverImage: restaurantDetails.coverImage || ''
            });
        } else {
            // Update existing restaurant
            if (restaurantDetails.restaurantName) restaurant.restaurantName = restaurantDetails.restaurantName;
            if (restaurantDetails.description !== undefined) restaurant.description = restaurantDetails.description;
            if (restaurantDetails.phone !== undefined) restaurant.phone = restaurantDetails.phone;
            if (restaurantDetails.address) restaurant.address = restaurantDetails.address;
            if (restaurantDetails.cuisine) restaurant.cuisine = restaurantDetails.cuisine;
            if (restaurantDetails.openingHours) restaurant.openingHours = restaurantDetails.openingHours;
            if (restaurantDetails.logo !== undefined) restaurant.logo = restaurantDetails.logo;
            if (restaurantDetails.coverImage !== undefined) restaurant.coverImage = restaurantDetails.coverImage;
        }

        await restaurant.save();
        res.json(restaurant);
    } catch (err) {
        console.error('Error updating restaurant profile:', err);
        console.error('Request body:', JSON.stringify(req.body, null, 2));
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
