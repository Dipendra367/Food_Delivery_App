const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/receipts/:orderId - Get receipt for an order
router.get('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('items.productId')
            .populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user owns this order or is admin
        if (order.userId._id.toString() !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Generate receipt HTML
        const receiptHTML = generateReceiptHTML(order);

        res.send(receiptHTML);
    } catch (err) {
        console.error('Error generating receipt:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/receipts/:orderId/data - Get receipt data as JSON
router.get('/:orderId/data', auth, async (req, res) => {
    try {
        console.log('Fetching receipt for order:', req.params.orderId);
        console.log('User ID:', req.user.userId);

        const order = await Order.findById(req.params.orderId)
            .populate('items.productId')
            .populate('userId', 'name email');

        console.log('Order found:', order ? 'Yes' : 'No');

        if (!order) {
            console.log('Order not found');
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order user ID:', order.userId._id.toString());
        console.log('Requesting user ID:', req.user.userId);

        // Verify user owns this order or is admin
        if (order.userId._id.toString() !== req.user.userId && !req.user.isAdmin) {
            console.log('Access denied - user does not own order');
            return res.status(403).json({ message: 'Access denied' });
        }

        const receiptData = {
            orderId: order._id,
            orderDate: order.createdAt,
            customer: {
                name: order.userId.name,
                email: order.userId.email
            },
            deliveryAddress: order.deliveryAddress,
            items: order.items.map(item => ({
                name: item.productId ? item.productId.name : 'Unknown Item',
                quantity: item.qty,
                price: item.price,
                total: item.qty * item.price
            })),
            subtotal: order.subtotal || order.total,
            deliveryCharge: order.deliveryCharge || 0,
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            transactionId: order.transactionId,
            status: order.status
        };

        console.log('Sending receipt data');
        res.json(receiptData);
    } catch (err) {
        console.error('Error fetching receipt data:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

function generateReceiptHTML(order) {
    const orderDate = new Date(order.createdAt).toLocaleString('en-NP', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - Order #${order._id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; padding: 20px; background: #f5f5f5; }
        .receipt { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #ea580c; font-size: 32px; margin-bottom: 5px; }
        .header p { color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .info-label { font-weight: 600; color: #555; }
        .info-value { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #f8f8f8; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .total-row { font-weight: bold; font-size: 16px; background: #f8f8f8; }
        .total-row td { padding: 15px 12px; border-top: 2px solid #ddd; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #ddd; padding-top: 20px; }
        @media print {
            body { background: white; padding: 0; }
            .receipt { box-shadow: none; }
            .no-print { display: none; }
        }
        .print-btn { background: #ea580c; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 20px; }
        .print-btn:hover { background: #c2410c; }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>FoodMandu AI</h1>
            <p>Order Receipt</p>
        </div>

        <div class="section">
            <div class="section-title">Order Information</div>
            <div class="info-row">
                <span class="info-label">Order ID:</span>
                <span class="info-value">#${order._id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${orderDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
                </span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Customer Details</div>
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${order.userId.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${order.userId.email}</span>
            </div>
        </div>

        ${order.deliveryAddress ? `
        <div class="section">
            <div class="section-title">Delivery Address</div>
            <div class="info-row">
                <span class="info-label">Label:</span>
                <span class="info-value">${order.deliveryAddress.label}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${order.deliveryAddress.street}, ${order.deliveryAddress.area}, ${order.deliveryAddress.city}</span>
            </div>
            ${order.deliveryAddress.landmark ? `
            <div class="info-row">
                <span class="info-label">Landmark:</span>
                <span class="info-value">${order.deliveryAddress.landmark}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${order.deliveryAddress.phone}</span>
            </div>
        </div>
        ` : ''}

        <div class="section">
            <div class="section-title">Order Items</div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                    <tr>
                        <td>${item.productId ? item.productId.name : 'Unknown Item'}</td>
                        <td class="text-right">${item.qty}</td>
                        <td class="text-right">NPR ${item.price.toFixed(2)}</td>
                        <td class="text-right">NPR ${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                    `).join('')}
                    <tr>
                        <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                        <td class="text-right">NPR ${(order.subtotal || order.total).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-right"><strong>Delivery Charge:</strong></td>
                        <td class="text-right">${(order.deliveryCharge === 0 || !order.deliveryCharge) ? 'FREE' : 'NPR ' + order.deliveryCharge.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="3" class="text-right">TOTAL:</td>
                        <td class="text-right">NPR ${order.total.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${order.paymentMethod.toUpperCase()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-value">
                    <span class="status-badge status-${order.paymentStatus}">${order.paymentStatus.toUpperCase()}</span>
                </span>
            </div>
            ${order.transactionId ? `
            <div class="info-row">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value">${order.transactionId}</span>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>Thank you for your order!</p>
            <p>For any queries, contact us at support@foodmandu.com</p>
        </div>

        <div class="no-print" style="text-align: center;">
            <button class="print-btn" onclick="window.print()">Print Receipt</button>
        </div>
    </div>
</body>
</html>
    `;
}

module.exports = router;
