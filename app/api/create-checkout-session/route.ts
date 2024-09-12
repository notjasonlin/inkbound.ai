import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const PLANS: { [key: number]: { priceId: string, amount: number } } = {
    100: { priceId: 'price_1PwBbrGqe0TKVbR1EIV9sp00', amount: 2000 }, // $20.00
    200: { priceId: 'price_1PwBbrGqe0TKVbR1EIV9sp01', amount: 2500 }, // $25.00
    300: { priceId: 'price_1PwBbrGqe0TKVbR1EIV9sp02', amount: 3000 }, // $30.00
};

export async function POST(req: Request) {
    try {
        console.log('Received request to create checkout session');
        
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not set');
        }
        if (!process.env.BASE_URL) {
            throw new Error('BASE_URL is not set');
        }

        const { credits, userId } = await req.json();
        console.log('Request data:', { credits, userId });

        if (!credits || !userId) {
            return NextResponse.json({ error: 'Missing credits or userId' }, { status: 400 });
        }

        const plan = PLANS[credits as keyof typeof PLANS];

        if (!plan) {
            console.error('Invalid credit amount');
            return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${credits} Credits`,
                        },
                        unit_amount: plan.amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/dashboard/upgrade`,
            client_reference_id: userId,
            metadata: {
                credits: credits.toString(),
            },
        });

        console.log('Checkout session created:', session);
        return NextResponse.json({ id: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        if (error instanceof Stripe.errors.StripeError) {
            console.error('Stripe error details:', error.message);
        }
        return NextResponse.json({ error: 'Error creating checkout session', details: error.message }, { status: 500 });
    }
}
