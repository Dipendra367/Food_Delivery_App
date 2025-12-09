const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        qty: {
            type: Number,
            required: true,
            default: 1
        },
        price: Number // Snapshot of price at time of order
    }],
    total: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        default: null
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    deliveryAddress: {
        label: String,
        street: String,
        city: String,
        area: String,
        landmark: String,
        phone: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantStatus: {
        type: String,
        enum: ['pending', 'accepted', 'preparing', 'ready', 'rejected'],
        default: 'pending'
    },
    rejectionReason: String,
    preparationTime: Number, // estimated minutes
    status: {
        type: String,
        enum: ['draft', 'pending', 'preparing', 'delivering', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'esewa', 'khalti'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
