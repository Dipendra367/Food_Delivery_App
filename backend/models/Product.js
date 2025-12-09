const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    image: String, // URL
    categories: [String], // e.g. ["Pizza", "Italian"]
    tags: [String], // e.g. ["spicy", "vegetarian", "cheese"]
    cuisine: String, // e.g. "Italian"
    totalOrders: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 100
    },
    inStock: {
        type: Boolean,
        default: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number, // in minutes
        default: 30
    },
    // Optional: Precomputed vector for similarity (if using embeddings later)
    metaVector: [Number]
}, { timestamps: true });

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
