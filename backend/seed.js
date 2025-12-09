const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Restaurant = require('./models/Restaurant');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food-delivery-mvp';

const products = [
    // MOMO
    {
        name: "Buff Steam Momo",
        restaurantId: "res_nepal_1",
        description: "Juicy buffalo meat dumplings served with spicy tomato achar.",
        price: 180,
        image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80",
        categories: ["Momo", "Lunch"],
        tags: ["spicy", "meat", "popular", "steamed"],
        cuisine: "Nepalese",
        totalOrders: 500
    },
    {
        name: "Chicken C. Momo",
        restaurantId: "res_nepal_1",
        description: "Fried chicken momos tossed in spicy chili sauce with bell peppers.",
        price: 250,
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        categories: ["Momo", "Snacks"],
        tags: ["spicy", "fried", "chicken"],
        cuisine: "Nepalese",
        totalOrders: 350
    },
    {
        name: "Veg Jhol Momo",
        restaurantId: "res_nepal_2",
        description: "Vegetable dumplings drowned in a tangy and savory sesame soup.",
        price: 200,
        image: "https://images.unsplash.com/photo-1596627162243-14743a03841b?auto=format&fit=crop&w=800&q=80",
        categories: ["Momo", "Soup"],
        tags: ["vegetarian", "soup", "comfort food"],
        cuisine: "Nepalese",
        totalOrders: 280
    },
    {
        name: "Fried Buff Momo",
        restaurantId: "res_nepal_1",
        description: "Crispy deep-fried buffalo meat dumplings.",
        price: 200,
        image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80",
        categories: ["Momo", "Snacks"],
        tags: ["fried", "meat", "crispy"],
        cuisine: "Nepalese",
        totalOrders: 300
    },
    {
        name: "Kothey Momo",
        restaurantId: "res_nepal_1",
        description: "Pan-fried momos, crispy on one side and soft on the other.",
        price: 220,
        image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80",
        categories: ["Momo", "Lunch"],
        tags: ["pan-fried", "meat", "popular"],
        cuisine: "Nepalese",
        totalOrders: 400
    },

    // TRADITIONAL MEALS (Thakali)
    {
        name: "Thakali Dal Bhat Set",
        restaurantId: "res_thakali",
        description: "Authentic Thakali set with rice, lentil soup, veg curry, spinach, pickles, and papad.",
        price: 450,
        image: "https://images.unsplash.com/photo-1626804475297-411d8631c8df?auto=format&fit=crop&w=800&q=80",
        categories: ["Thakali", "Meal", "Dinner"],
        tags: ["vegetarian", "heavy", "traditional", "rice"],
        cuisine: "Nepalese",
        totalOrders: 600
    },
    {
        name: "Mutton Thakali Set",
        restaurantId: "res_thakali",
        description: "Premium Thakali set served with tender mutton curry.",
        price: 650,
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
        categories: ["Thakali", "Meal", "Dinner"],
        tags: ["meat", "heavy", "traditional", "rice"],
        cuisine: "Nepalese",
        totalOrders: 450
    },
    {
        name: "Dhindo Set",
        restaurantId: "res_thakali",
        description: "Traditional buckwheat porridge served with local chicken curry and gundruk.",
        price: 550,
        image: "https://images.unsplash.com/photo-1626804475297-411d8631c8df?auto=format&fit=crop&w=800&q=80",
        categories: ["Thakali", "Meal", "Traditional"],
        tags: ["healthy", "traditional", "dhindo"],
        cuisine: "Nepalese",
        totalOrders: 200
    },

    // NEWARI
    {
        name: "Newari Samay Baji",
        restaurantId: "res_newari",
        description: "Traditional Newari platter with beaten rice, choila, bara, and pickles.",
        price: 350,
        image: "https://images.unsplash.com/photo-1606491956689-2ea28c67445c?auto=format&fit=crop&w=800&q=80",
        categories: ["Newari", "Snacks", "Traditional"],
        tags: ["spicy", "meat", "cultural"],
        cuisine: "Newari",
        totalOrders: 200
    },
    {
        name: "Chicken Choila",
        restaurantId: "res_newari",
        description: "Spicy grilled chicken marinated with ginger, garlic, and mustard oil.",
        price: 320,
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
        categories: ["Newari", "Snacks", "Appetizer"],
        tags: ["spicy", "meat", "grilled"],
        cuisine: "Newari",
        totalOrders: 250
    },
    {
        name: "Bara (Wo)",
        restaurantId: "res_newari",
        description: "Savory lentil pancake, a classic Newari snack.",
        price: 150,
        image: "https://images.unsplash.com/photo-1606491956689-2ea28c67445c?auto=format&fit=crop&w=800&q=80",
        categories: ["Newari", "Snacks"],
        tags: ["vegetarian", "pancake", "traditional"],
        cuisine: "Newari",
        totalOrders: 180
    },
    {
        name: "Yomari",
        restaurantId: "res_newari",
        description: "Steamed dumpling made of rice flour with sweet molasses filling.",
        price: 120,
        image: "https://images.unsplash.com/photo-1606491956689-2ea28c67445c?auto=format&fit=crop&w=800&q=80",
        categories: ["Newari", "Dessert"],
        tags: ["sweet", "traditional", "festival"],
        cuisine: "Newari",
        totalOrders: 150
    },

    // NOODLES
    {
        name: "Chicken Chowmein",
        restaurantId: "res_fastfood",
        description: "Stir-fried noodles with chicken, cabbage, and carrots.",
        price: 220,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
        categories: ["Noodles", "Lunch"],
        tags: ["fried", "chicken", "fast food"],
        cuisine: "Chinese-Nepalese",
        totalOrders: 400
    },
    {
        name: "Mixed Thukpa",
        restaurantId: "res_fastfood",
        description: "Hot noodle soup with mixed meat, egg, and vegetables.",
        price: 240,
        image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80",
        categories: ["Noodles", "Soup"],
        tags: ["soup", "warm", "winter special"],
        cuisine: "Tibetan-Nepalese",
        totalOrders: 300
    },
    {
        name: "Keema Noodles",
        restaurantId: "res_fastfood",
        description: "Noodles topped with spicy minced meat gravy.",
        price: 300,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
        categories: ["Noodles", "Lunch"],
        tags: ["spicy", "meat", "gravy"],
        cuisine: "Nepalese",
        totalOrders: 250
    },

    // SNACKS
    {
        name: "Sel Roti (5 pcs)",
        restaurantId: "res_snacks",
        description: "Sweet ring-shaped rice bread, deep-fried to perfection.",
        price: 100,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        categories: ["Snacks", "Breakfast"],
        tags: ["sweet", "vegetarian", "festival"],
        cuisine: "Nepalese",
        totalOrders: 150
    },
    {
        name: "Chicken Sausage",
        restaurantId: "res_snacks",
        description: "Fried chicken sausages served with ketchup and mustard.",
        price: 150,
        image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80",
        categories: ["Snacks"],
        tags: ["fried", "meat", "fast food"],
        cuisine: "Western",
        totalOrders: 200
    },
    {
        name: "French Fries",
        restaurantId: "res_snacks",
        description: "Crispy salted french fries.",
        price: 120,
        image: "https://images.unsplash.com/photo-1573080496987-a199f8cd75ec?auto=format&fit=crop&w=800&q=80",
        categories: ["Snacks"],
        tags: ["vegetarian", "fried", "fast food"],
        cuisine: "Western",
        totalOrders: 500
    },
    // EXTRA MIGRATED PRODUCTS
    {
        name: 'Chicken Momo',
        description: 'Steamed dumplings filled with spiced minced chicken, served with tomato achar.',
        price: 250,
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
        categories: ['Momo', 'Lunch'],
        tags: ['Popular', 'Spicy'],
        restaurantId: "res_nepal_1",
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
        restaurantId: "res_nepal_1",
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
        restaurantId: "res_nepal_1",
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
        restaurantId: "res_nepal_1",
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
        restaurantId: "res_nepal_1",
        cuisine: 'Newari',
        preparationTime: 25,
        isAvailable: true
    },

    // MOMO PARADISE PRODUCTS
    {
        name: 'Pork Steam Momo',
        description: 'Juicy pork dumplings steamed to perfection, served with spicy sesame chutney.',
        price: 280,
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
        categories: ['Momo', 'Lunch'],
        tags: ['Spicy', 'Meat', 'Popular'],
        restaurantId: "res_momo_paradise",
        cuisine: 'Nepali',
        preparationTime: 25,
        isAvailable: true
    },
    {
        name: 'Paneer Momo',
        description: 'Cottage cheese dumplings with herbs and spices, perfect for vegetarians.',
        price: 240,
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
        categories: ['Momo', 'Lunch'],
        tags: ['Vegetarian', 'Healthy'],
        restaurantId: "res_momo_paradise",
        cuisine: 'Nepali',
        preparationTime: 20,
        isAvailable: true
    },
    {
        name: 'Mixed Jhol Momo',
        description: 'Chicken and vegetable momos served in a flavorful sesame-tomato soup.',
        price: 300,
        image: 'https://images.unsplash.com/photo-1596627162243-14743a03841b?w=800&q=80',
        categories: ['Momo', 'Soup'],
        tags: ['Spicy', 'Comfort Food', 'Popular'],
        restaurantId: "res_momo_paradise",
        cuisine: 'Nepali',
        preparationTime: 25,
        isAvailable: true
    },
    {
        name: 'Tandoori Momo',
        description: 'Grilled momos marinated in tandoori spices, served with mint chutney.',
        price: 320,
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
        categories: ['Momo', 'Grilled'],
        tags: ['Spicy', 'Grilled', 'Premium'],
        restaurantId: "res_momo_paradise",
        cuisine: 'Fusion',
        preparationTime: 30,
        isAvailable: true
    },
    {
        name: 'Cheese Momo',
        description: 'Momos filled with melted cheese and vegetables, a crowd favorite.',
        price: 260,
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
        categories: ['Momo', 'Snacks'],
        tags: ['Vegetarian', 'Cheese', 'Popular'],
        restaurantId: "res_momo_paradise",
        cuisine: 'Fusion',
        preparationTime: 20,
        isAvailable: true
    },
    {
        name: 'Chocolate Momo',
        description: 'Sweet dessert momos filled with melted chocolate and nuts.',
        price: 180,
        image: 'https://images.unsplash.com/photo-1606491956689-2ea28c674675?w=800&q=80',
        categories: ['Momo', 'Dessert'],
        tags: ['Sweet', 'Dessert', 'Unique'],
        restaurantId: "res_momo_paradise",
        cuisine: 'Fusion',
        preparationTime: 15,
        isAvailable: true
    },
    {
        name: 'Open Momo',
        description: 'Open-faced momos topped with spicy sauce, vegetables, and mayo.',
        price: 290,
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
        categories: ['Momo', 'Snacks'],
        tags: ['Spicy', 'Unique', 'Popular'],
        restaurantId: "res_momo_paradise",
        cuisine: 'Fusion',
        preparationTime: 25,
        isAvailable: true
    },
    {
        name: 'Sadeko Momo',
        description: 'Spicy marinated momos tossed with onions, tomatoes, and special spices.',
        price: 270,
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80',
        categories: ['Momo', 'Snacks'],
        tags: ['Spicy', 'Tangy', 'Popular'],
        restaurantId: "res_momo_paradise",
        cuisine: 'Nepali',
        preparationTime: 20,
        isAvailable: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Remove deleteMany to preserve data
        // await Product.deleteMany({});
        // await User.deleteMany({});
        // await Order.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('admin123', salt);
        const userHash = await bcrypt.hash('user123', salt);
        const restaurantHash = await bcrypt.hash('restaurant123', salt);

        // 1. Create/Update Users
        const upsertUser = async (userData) => {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                user = await User.create(userData);
                console.log(`Created user: ${userData.email}`);
            } else {
                console.log(`User already exists: ${userData.email}`);
            }
            return user;
        };

        const admin = await upsertUser({
            name: 'Admin User',
            email: 'admin@fooddelivery.com',
            passwordHash: adminHash,
            isAdmin: true,
            isVerified: true,
            role: 'admin'
        });

        const customer = await upsertUser({
            name: 'Ramesh Gupta',
            email: 'user@example.com',
            passwordHash: userHash,
            isAdmin: false,
            isVerified: true,
            role: 'customer'
        });

        // 2. Create/Update Restaurants
        const restaurant1 = await upsertUser({
            name: 'NepEats Kitchen',
            email: 'restaurant@nepeats.com',
            passwordHash: restaurantHash,
            role: 'restaurant',
            isVerified: true,
            restaurantDetails: {
                restaurantName: 'NepEats Kitchen',
                description: 'The original NepEats kitchen serving authentic Nepali cuisine.',
                cuisine: ['Nepali', 'Newari', 'Thakali'],
                address: { street: 'Durbar Marg', city: 'Kathmandu', area: 'Central' },
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

        const restaurant2 = await upsertUser({
            name: 'Thakali Ghar',
            email: 'thakali@nepeats.com',
            passwordHash: restaurantHash,
            role: 'restaurant',
            isVerified: true,
            restaurantDetails: {
                restaurantName: 'Thakali Ghar',
                description: 'Best Thakali in town.',
                cuisine: ['Thakali'],
                address: { street: 'Lazimpat', city: 'Kathmandu', area: 'North' },
                phone: '9800000001',
                isActive: true,
                isApproved: true
            }
        });

        const restaurant3 = await upsertUser({
            name: 'Momo Paradise',
            email: 'momoparadise@nepeats.com',
            passwordHash: restaurantHash,
            role: 'restaurant',
            isVerified: true,
            restaurantDetails: {
                restaurantName: 'Momo Paradise',
                description: 'Specializing in all varieties of momos - from traditional to fusion.',
                cuisine: ['Nepali', 'Tibetan', 'Fusion'],
                address: { street: 'Thamel', city: 'Kathmandu', area: 'Tourist Hub' },
                phone: '9800000002',
                email: 'momoparadise@nepeats.com',
                isActive: true,
                isApproved: true,
                rating: 4.6,
                totalReviews: 95,
                openingHours: [
                    { day: 'Monday', open: '10:00', close: '23:00' },
                    { day: 'Tuesday', open: '10:00', close: '23:00' },
                    { day: 'Wednesday', open: '10:00', close: '23:00' },
                    { day: 'Thursday', open: '10:00', close: '23:00' },
                    { day: 'Friday', open: '10:00', close: '23:00' },
                    { day: 'Saturday', open: '10:00', close: '23:00' },
                    { day: 'Sunday', open: '10:00', close: '23:00' }
                ]
            }
        });

        console.log('Users and Restaurants synced');

        // 2.5. Create Restaurant documents
        const upsertRestaurant = async (userId, restaurantData) => {
            let restaurant = await Restaurant.findOne({ userId });
            if (!restaurant) {
                restaurant = await Restaurant.create({ userId, ...restaurantData });
                console.log(`Created restaurant document for: ${restaurantData.restaurantName}`);
            } else {
                console.log(`Restaurant document already exists: ${restaurantData.restaurantName}`);
            }
            return restaurant;
        };

        const restaurantDoc1 = await upsertRestaurant(restaurant1._id, {
            restaurantName: 'NepEats Kitchen',
            description: 'The original NepEats kitchen serving authentic Nepali cuisine.',
            cuisine: ['Nepali', 'Newari', 'Thakali'],
            address: {
                street: 'Durbar Marg',
                city: 'Kathmandu',
                area: 'Central',
                coordinates: { lat: 27.7172, lng: 85.3240 }
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
        });

        const restaurantDoc2 = await upsertRestaurant(restaurant2._id, {
            restaurantName: 'Thakali Ghar',
            description: 'Best Thakali in town.',
            cuisine: ['Thakali'],
            address: {
                street: 'Lazimpat',
                city: 'Kathmandu',
                area: 'North',
                coordinates: { lat: 27.7340, lng: 85.3240 }
            },
            phone: '9800000001',
            email: 'thakali@nepeats.com',
            isActive: true,
            isApproved: true,
            rating: 4.5,
            totalReviews: 85,
            openingHours: [
                { day: 'Monday', open: '10:00', close: '21:00' },
                { day: 'Tuesday', open: '10:00', close: '21:00' },
                { day: 'Wednesday', open: '10:00', close: '21:00' },
                { day: 'Thursday', open: '10:00', close: '21:00' },
                { day: 'Friday', open: '10:00', close: '21:00' },
                { day: 'Saturday', open: '10:00', close: '21:00' },
                { day: 'Sunday', open: '10:00', close: '21:00', isClosed: false }
            ]
        });

        const restaurantDoc3 = await upsertRestaurant(restaurant3._id, {
            restaurantName: 'Momo Paradise',
            description: 'Specializing in all varieties of momos - from traditional to fusion.',
            cuisine: ['Nepali', 'Tibetan', 'Fusion'],
            address: {
                street: 'Thamel',
                city: 'Kathmandu',
                area: 'Tourist Hub',
                coordinates: { lat: 27.7145, lng: 85.3120 }
            },
            phone: '9800000002',
            email: 'momoparadise@nepeats.com',
            isActive: true,
            isApproved: true,
            rating: 4.6,
            totalReviews: 95,
            openingHours: [
                { day: 'Monday', open: '10:00', close: '23:00' },
                { day: 'Tuesday', open: '10:00', close: '23:00' },
                { day: 'Wednesday', open: '10:00', close: '23:00' },
                { day: 'Thursday', open: '10:00', close: '23:00' },
                { day: 'Friday', open: '10:00', close: '23:00' },
                { day: 'Saturday', open: '10:00', close: '23:00' },
                { day: 'Sunday', open: '10:00', close: '23:00' }
            ]
        });

        // 3. Map string IDs to real ObjectIds (use Restaurant document IDs for products)
        const restaurantMap = {
            "res_nepal_1": restaurantDoc1._id,
            "res_nepal_2": restaurantDoc1._id,
            "res_thakali": restaurantDoc2._id,
            "res_newari": restaurantDoc1._id,
            "res_fastfood": restaurantDoc2._id,
            "res_snacks": restaurantDoc2._id,
            "res_momo_paradise": restaurantDoc3._id
        };

        // 4. Upsert Products
        const productsWithIds = products.map(p => ({
            ...p,
            restaurantId: restaurantMap[p.restaurantId] || restaurant1._id
        }));

        let newProductsCount = 0;
        for (const p of productsWithIds) {
            const existingProduct = await Product.findOne({ name: p.name, restaurantId: p.restaurantId });
            if (!existingProduct) {
                await Product.create(p);
                newProductsCount++;
            }
        }
        console.log(`Products synced. Added ${newProductsCount} new products.`);

        // 5. Create past orders (Only if none exist for this user)
        const existingOrders = await Order.countDocuments({ userId: customer._id });
        if (existingOrders === 0) {
            // Fetch products again to get their IDs
            const allProducts = await Product.find({});
            const momoProducts = allProducts.filter(p => p.categories.includes('Momo'));

            if (momoProducts.length >= 2) {
                await Order.create({
                    userId: customer._id,
                    restaurantId: restaurant1._id,
                    items: [
                        { productId: momoProducts[0]._id, qty: 2, price: momoProducts[0].price },
                        { productId: momoProducts[1]._id, qty: 1, price: momoProducts[1].price }
                    ],
                    subtotal: (momoProducts[0].price * 2) + momoProducts[1].price,
                    total: (momoProducts[0].price * 2) + momoProducts[1].price,
                    status: 'delivered',
                    restaurantStatus: 'ready'
                });
                console.log('Sample order seeded for user');
            }
        } else {
            console.log('Orders already exist, skipping seed.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
