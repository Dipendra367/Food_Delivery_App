const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    discountPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validTo: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive &&
        now >= this.validFrom &&
        now <= this.validTo &&
        (this.usageLimit === null || this.usedCount < this.usageLimit);
};

module.exports = mongoose.model('Coupon', couponSchema);
