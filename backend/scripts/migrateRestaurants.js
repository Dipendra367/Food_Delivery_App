const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food-delivery-mvp');
        console.log('MongoDB Connected');

        // 1. Create Default Restaurant User
        let defaultRestaurant = await User.findOne({ email: 'restaurant@nepeats.com' });
        const salt = await bcrypt.genSalt(10);
        const restaurantHash = await bcrypt.hash('restaurant123', salt);

        if (!defaultRestaurant) {
            console.log('Creating default restaurant user...');
            defaultRestaurant = new User({
                name: 'NepEats Kitchen',
                email: 'restaurant@nepeats.com',
                passwordHash: restaurantHash,
                role: 'restaurant',
                emailVerified: true,
                restaurantDetails: {
                    restaurantName: 'NepEats Kitchen',
                    description: 'The original NepEats kitchen serving authentic Nepali cuisine.',
                    cuisine: ['Nepali', 'Newari', 'Thakali'],
                    address: {
                        street: 'Durbar Marg',
                        city: 'Kathmandu',
                        area: 'Central'
                    },
                    phone: '9800000000',
                    email: 'restaurant@nepeats.com',
                    isActive: true,
                    isApproved: true,
                    rating: 4.8,
                    totalReviews: 120,
                    openingHours: [
                        { day: 'Monday', open: '09:00', close: '22:00' },
                        { day: 'Tuesday', open: '09:00', close: '22:00' },
                        { day: 'Wednesday', open: '09:00', close: '22:00' },
                        { day: 'Thursday', open: '09:00', close: '22:00' },
                        { day: 'Friday', open: '09:00', close: '22:00' },
                        { day: 'Saturday', open: '09:00', close: '22:00' },
                        { day: 'Sunday', open: '09:00', close: '22:00' }
                    ]
                }
            });
            await defaultRestaurant.save();
            console.log('Default restaurant created:', defaultRestaurant._id);
        } else {
            console.log('Default restaurant already exists:', defaultRestaurant._id);
            // Update password just in case
            defaultRestaurant.passwordHash = restaurantHash;
            await defaultRestaurant.save();
            console.log('Updated default restaurant password to "restaurant123"');
        }

        // 2. Update Products
        console.log('Updating products...');
        const result = await Product.updateMany(
            {
                $or: [
                    { restaurantId: { $exists: false } },
                    { restaurantId: { $type: 'string' } } // If it was a string before
                ]
            },
            {
                $set: {
                    restaurantId: defaultRestaurant._id,
                    isAvailable: true,
                    preparationTime: 30
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} products.`);

        // 3. Seed Sample Products if none exist
        const productCount = await Product.countDocuments({ restaurantId: defaultRestaurant._id });
        if (productCount === 0) {
            console.log('Seeding sample products for NepEats Kitchen...');
            const sampleProducts = [
                {
                    name: 'Chicken Momo',
                    description: 'Steamed dumplings filled with spiced minced chicken, served with tomato achar.',
                    price: 250,
                    image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
                    categories: ['Momo', 'Lunch'],
                    tags: ['Popular', 'Spicy'],
                    restaurantId: defaultRestaurant._id,
                    cuisine: 'Nepali',
                    preparationTime: 20,
                    isAvailable: true
                },
                {
                    name: 'Buff Chowmein',
                    description: 'Stir-fried noodles with buffalo meat and fresh vegetables.',
                    price: 220,
                    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
                    categories: ['Noodles', 'Lunch'],
                    tags: ['Fried'],
                    restaurantId: defaultRestaurant._id,
                    cuisine: 'Nepali',
                    preparationTime: 15,
                    isAvailable: true
                },
                {
                    name: 'Thakali Set (Chicken)',
                    description: 'Traditional Nepali set meal with rice, lentil soup, chicken curry, spinach, and pickles.',
                    price: 550,
                    image: 'https://images.unsplash.com/photo-1626804475297-411d863b5285?w=800&q=80',
                    categories: ['Thakali', 'Dinner'],
                    tags: ['Heavy', 'Traditional'],
                    restaurantId: defaultRestaurant._id,
                    cuisine: 'Thakali',
                    preparationTime: 30,
                    isAvailable: true
                },
                {
                    name: 'Sel Roti with Aloo Dum',
                    description: 'Traditional sweet rice flour ring bread served with spicy potato curry.',
                    price: 150,
                    image: 'https://images.unsplash.com/photo-1606491956689-2ea28c674675?w=800&q=80',
                    categories: ['Breakfast', 'Snacks'],
                    tags: ['Vegetarian'],
                    restaurantId: defaultRestaurant._id,
                    cuisine: 'Nepali',
                    preparationTime: 10,
                    isAvailable: true
                },
                {
                    name: 'Newari Khaja Set',
                    description: 'Assorted Newari snacks including beaten rice, choila, aloo tama, and bhatmas sadeko.',
                    price: 450,
                    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
                    categories: ['Newari', 'Snacks'],
                    tags: ['Spicy', 'Platter'],
                    restaurantId: defaultRestaurant._id,
                    cuisine: 'Newari',
                    preparationTime: 25,
                    isAvailable: true
                }
            ];
            await Product.insertMany(sampleProducts);
            console.log('Sample products seeded.');
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
