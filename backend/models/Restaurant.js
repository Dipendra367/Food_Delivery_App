const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    cuisine: [{
        type: String
    }],
    address: {
        street: String,
        city: String,
        area: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    openingHours: [{
        day: String,
        open: String,
        close: String,
        isClosed: {
            type: Boolean,
            default: false
        }
    }],
    rating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
restaurantSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
