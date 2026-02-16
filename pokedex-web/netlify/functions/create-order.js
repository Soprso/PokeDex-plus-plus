const Razorpay = require('razorpay');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { amount, currency } = JSON.parse(event.body);

        // Env variables should be set in Netlify UI
        const rzp = new Razorpay({
            key_id: process.env.VITE_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // convert to subunits
            currency: currency || 'USD',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await rzp.orders.create(options);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
        };
    } catch (error) {
        console.error('[Backend] Order Creation Failed:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
