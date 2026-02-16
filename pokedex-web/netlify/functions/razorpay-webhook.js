const crypto = require('crypto');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET';
    const signature = event.headers['x-razorpay-signature'];

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(event.body)
        .digest('hex');

    if (signature === expectedSignature) {
        try {
            const body = JSON.parse(event.body);

            if (body.event === 'payment.captured') {
                const paymentDetails = body.payload.payment.entity;
                console.log('[Webhook] Payment Captured for Order:', paymentDetails.order_id);

                // TODO: Update Clerk metadata or database here
                // Note: Netlify functions are stateless, so you must use an external API/DB.
            }

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ok' }),
            };
        } catch (err) {
            console.error('[Webhook] Parsing Error:', err);
            return { statusCode: 400, body: 'Invalid Body' };
        }
    } else {
        console.warn('[Webhook] Invalid Signature Received');
        return {
            statusCode: 400,
            body: 'Invalid signature',
        };
    }
};
