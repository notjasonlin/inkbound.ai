import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { plans } from '@/app/dashboard/upgrade/constants';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { planId, userId, interval } = await req.json();

    if (!planId || !userId || !interval) {
      return NextResponse.json({ error: 'Missing planId, userId, or interval' }, { status: 400 });
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = interval === 'month' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid price for the selected plan and interval' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { data: userData, error: userError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const { data: userEmail } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      const customer = await stripe.customers.create({
        email: userEmail?.email,
        metadata: { userId },
      });
      customerId = customer.id;

      await supabase
        .from('user_subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/upgrade`,
      metadata: { 
        userId, 
        planId, 
        interval,
        schoolLimit: plan.schoolLimit.toString(),
        templateLimit: plan.templateLimit.toString(),
        aiCallLimit: plan.aiCallLimit.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Error fetching data:', error.message);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create subscription', details: errorMessage }, 
      { status: 500 }
    );
  }
}
