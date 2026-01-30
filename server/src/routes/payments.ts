import express from 'express';
import Stripe from 'stripe';
import db from '../db';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    typescript: true,
});

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

        const booking = await db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId) as any;
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const amount = Math.round((booking.total_price || booking.price) * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'inr',
            automatic_payment_methods: { enabled: true },
            metadata: { bookingId: booking.id }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: 'Payment initiation failed', details: error.message });
    }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret && sig) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            event = JSON.parse(req.body.toString());
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const bookingId = paymentIntent.metadata.bookingId;

            console.log(`Payment succeeded for booking ${bookingId}`);

            try {
                await db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('confirmed', bookingId);
            } catch (dbErr) {
                console.error("DB Error updating booking via webhook:", dbErr);
            }
            break;

        case 'payment_intent.payment_failed':
            console.warn(`Payment failed for ${event.data.object.id}`);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

export default router;
