const express = require('express');
const router = express.Router();
const Product = require('../models/Product');


// GET /api/products
// Supports ?q=searchterm & ?category=Pizza
router.get('/', async (req, res) => {
    try {
        const { q, category } = req.query;
        let query = {};

        if (category) {
            query.categories = category;
        }

        if (q) {
            query.$text = { $search: q };
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
