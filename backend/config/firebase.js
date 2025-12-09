const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

try {
    // Try to load from file first
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '../serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized');
} catch (error) {
    console.error('Firebase Admin Initialization Failed:', error.message);
    console.error('Please ensure serviceAccountKey.json exists in backend root or FIREBASE_SERVICE_ACCOUNT_PATH is set.');
}

module.exports = admin;
