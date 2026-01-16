const express = require('express');
const router = express.Router();
const Product = require('../models/Product');


// SEARCH & FILTER PRODUCTS
router.get("/search", async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;

    let query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
});

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
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        const products = await Product.find(query).populate('restaurantId');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('restaurantId');
        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
