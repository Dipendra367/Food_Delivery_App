const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');

// POST /api/orders - Create Order
router.post('/', auth, async (req, res) => {
    try {
        const { items, paymentMethod, deliveryAddressId, deliveryAddress: inlineAddress, couponCode } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // Get user and check email verification
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verification check removed to make it optional
        // if (!user.emailVerified && !user.phoneVerified) { ... }

        // Get delivery address
        let deliveryAddress = null;
        if (deliveryAddressId) {
            // Use saved address by ID
            deliveryAddress = user.addresses.id(deliveryAddressId);
            if (!deliveryAddress) {
                return res.status(404).json({ message: 'Delivery address not found' });
            }
        } else if (inlineAddress) {
            // Use inline address provided in request
            deliveryAddress = inlineAddress;
        } else {
            // Use default address
            deliveryAddress = user.addresses.find(addr => addr.isDefault);
            if (!deliveryAddress && user.addresses.length > 0) {
                deliveryAddress = user.addresses[0];
            }
        }

        let total = 0;
        const orderItems = [];
        let restaurantId = null;

        // Validate items and calculate total
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }

            // Check if product belongs to a restaurant
            if (!product.restaurantId) {
                // Fallback for legacy products or handle error
                // For now, we might skip or error out. 
                // Ideally, migration script should have run.
                // return res.status(400).json({ message: `Product ${product.name} is not linked to a restaurant` });
            }

            // Enforce single restaurant per order
            if (restaurantId && product.restaurantId.toString() !== restaurantId.toString()) {
                return res.status(400).json({ message: 'Orders cannot contain items from multiple restaurants' });
            }
            restaurantId = product.restaurantId;

            const qty = item.qty || 1;

            // Check stock availability
            if (!product.inStock || product.stock < qty) {
                return res.status(400).json({
                    message: `${product.name} is out of stock or insufficient quantity available. Available: ${product.stock}`
                });
            }

            // Check availability
            if (product.isAvailable === false) {
                return res.status(400).json({
                    message: `${product.name} is currently unavailable`
                });
            }

            orderItems.push({
                productId: product._id,
                qty,
                price: product.price
            });
            total += product.price * qty;

            // Increment totalOrders for popularity
            product.totalOrders += qty;

            // Reduce stock
            product.stock -= qty;
            if (product.stock <= 0) {
                product.inStock = false;
            }

            await product.save();
        }

        // Calculate delivery charges
        const FREE_DELIVERY_THRESHOLD = parseFloat(process.env.FREE_DELIVERY_THRESHOLD) || 500;
        const DELIVERY_CHARGE = parseFloat(process.env.DELIVERY_CHARGE) || 50;

        const subtotal = total;
        const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

        // Apply Coupon
        let discountAmount = 0;
        if (couponCode) {
            if (typeof couponCode !== 'string') {
                return res.status(400).json({ message: 'Only one coupon code can be applied per order' });
            }
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon) {
                if (!coupon.isValid()) {
                    return res.status(400).json({ message: 'Coupon is expired or inactive' });
                }
                if (subtotal < coupon.minOrderAmount) {
                    return res.status(400).json({ message: `Minimum order amount of NPR ${coupon.minOrderAmount} required for this coupon` });
                }

                discountAmount = (subtotal * coupon.discountPercent) / 100;
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }

                // Increment usage count
                coupon.usedCount += 1;
                await coupon.save();
            } else {
                return res.status(400).json({ message: 'Invalid coupon code' });
            }
        }

        const finalTotal = subtotal + deliveryCharge - discountAmount;

        const order = new Order({
            userId: req.user.userId,
            restaurantId, // Set the restaurant ID
            items: orderItems,
            subtotal,
            deliveryCharge,
            couponCode: couponCode ? couponCode.toUpperCase() : null,
            discountAmount,
            total: finalTotal,
            deliveryAddress: deliveryAddress ? {
                label: deliveryAddress.label,
                street: deliveryAddress.street,
                city: deliveryAddress.city,
                area: deliveryAddress.area,
                landmark: deliveryAddress.landmark,
                phone: deliveryAddress.phone
            } : null,
            status: req.body.status || 'pending',
            restaurantStatus: 'pending',
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: paymentMethod === 'cash' ? 'completed' : 'pending'
        });

        await order.save();

        // Update user's order history
        await User.findByIdAndUpdate(req.user.userId, { $push: { orders: order._id } });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET /api/orders - List User Orders
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.user.userId,
            status: { $ne: 'draft' }
        })
            .sort({ createdAt: -1 })
            .populate('items.productId');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
