const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const rzp = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Endpoint to create a secure Order
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: Math.round(amount * 100), // convert to subunits
            currency: currency || 'USD',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await rzp.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Order Creation Failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Webhook to handle payment success asynchronously
app.post('/api/webhook', (req, res) => {
    const secret = 'YOUR_WEBHOOK_SECRET'; // Set this in Razorpay Dashboard
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature === expectedSignature) {
        if (req.body.event === 'payment.captured') {
            const paymentDetails = req.body.payload.payment.entity;
            // TODO: Update your database or Clerk metadata here
            console.log('Payment Captured for Order:', paymentDetails.order_id);
        }
        res.json({ status: 'ok' });
    } else {
        res.status(400).send('Invalid signature');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Razorpay Backend running on port ${PORT}`));
