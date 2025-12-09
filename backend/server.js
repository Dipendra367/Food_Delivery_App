require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food-delivery-mvp';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
// app.use('/api/restaurants', require('./routes/restaurants')); // Removed as it doesn't exist, use public.js
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/receipts', require('./routes/receipts'));
app.use('/api/restaurant', require('./routes/restaurant')); // Restaurant dashboard routes
app.use('/api/public', require('./routes/public'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews')); // New Reviews Route

// Health Check
app.get('/', (req, res) => {
    res.send('Food Delivery API is running...');
});

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
