const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// eSewa Configuration
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
const ESEWA_MERCHANT_SECRET = process.env.ESEWA_MERCHANT_SECRET || '8gBm/:&EnhH.1/q';
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL || 'http://localhost:5000/api/payments/esewa/success';
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL || 'http://localhost:5000/api/payments/esewa/failure';
const ESEWA_PAYMENT_URL = process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

// Khalti Configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'f6392a0b6c2b43ff977c62d06e832350';
const KHALTI_PUBLIC_KEY = process.env.KHALTI_PUBLIC_KEY || 'fb16f042f5614366804effb4879e1c80';
const KHALTI_API_URL = process.env.KHALTI_API_URL || 'https://a.khalti.com/api/v2';

// Helper function to generate eSewa signature
function generateEsewaSignature(message, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('base64');
}

// POST /api/payments/esewa/initiate
router.post('/esewa/initiate', auth, async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // eSewa v2 API expects amount in NPR (not paisa)
        const amount = order.total.toString();
        const taxAmount = '0';
        const serviceCharge = '0';
        const deliveryCharge = '0';
        const totalAmount = amount;

        // Generate unique transaction UUID
        const transactionUuid = `${orderId}-${Date.now()}`;

        // Create message for signature: total_amount,transaction_uuid,product_code
        const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_MERCHANT_ID}`;
        const signature = generateEsewaSignature(message, ESEWA_MERCHANT_SECRET);

        const paymentData = {
            amount: amount,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            transaction_uuid: transactionUuid,
            product_code: ESEWA_MERCHANT_ID,
            product_service_charge: serviceCharge,
            product_delivery_charge: deliveryCharge,
            success_url: ESEWA_SUCCESS_URL,
            failure_url: ESEWA_FAILURE_URL,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature: signature
        };

        res.json({
            paymentUrl: ESEWA_PAYMENT_URL,
            paymentData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/payments/esewa/success
router.get('/esewa/success', async (req, res) => {
    try {
        const { data } = req.query;

        // Decode the base64 encoded data
        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
        const { transaction_uuid, total_amount, transaction_code } = decodedData;

        // Extract orderId from transaction_uuid (format: orderId-timestamp)
        const orderId = transaction_uuid.split('-')[0];

        // Update the order
        const order = await Order.findById(orderId);
        if (order) {
            order.paymentStatus = 'completed';
            order.status = 'preparing'; // Payment successful, order confirmed
            order.transactionId = transaction_code;
            await order.save();
        }

        // Redirect to frontend success page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/payment/success?orderId=${orderId}&refId=${transaction_code}`);
    } catch (err) {
        console.error(err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/payment/failure`);
    }
});

// GET /api/payments/esewa/failure
router.get('/esewa/failure', async (req, res) => {
    try {
        const { data } = req.query;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (data) {
            const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
            const { transaction_uuid } = decodedData;
            const orderId = transaction_uuid.split('-')[0];

            const order = await Order.findById(orderId);
            if (order) {
                order.paymentStatus = 'failed';
                await order.save();
            }

            res.redirect(`${frontendUrl}/payment/failure?orderId=${orderId}`);
        } else {
            res.redirect(`${frontendUrl}/payment/failure`);
        }
    } catch (err) {
        console.error(err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/payment/failure`);
    }
});

// POST /api/payments/khalti/initiate
router.post('/khalti/initiate', auth, async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Khalti expects amount in paisa (1 NPR = 100 paisa)
        const amountInPaisa = order.total * 100;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        res.json({
            publicKey: KHALTI_PUBLIC_KEY,
            amount: amountInPaisa,
            orderId: orderId,
            productIdentity: orderId,
            productName: 'Food Order',
            productUrl: frontendUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/payments/khalti/verify
router.post('/khalti/verify', auth, async (req, res) => {
    try {
        const { token, amount, orderId } = req.body;

        // Verify payment with Khalti API
        const verifyUrl = `${KHALTI_API_URL}/payment/verify/`;

        const response = await axios.post(verifyUrl, {
            token,
            amount
        }, {
            headers: {
                'Authorization': `Key ${KHALTI_SECRET_KEY}`
            }
        });

        if (response.data && response.data.idx) {
            // Payment verified successfully
            const order = await Order.findById(orderId);
            if (order) {
                order.paymentStatus = 'completed';
                order.status = 'preparing'; // Payment successful, order confirmed
                order.transactionId = response.data.idx;
                await order.save();
            }

            res.json({
                success: true,
                message: 'Payment verified successfully',
                transactionId: response.data.idx
            });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
