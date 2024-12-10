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
    const { userId, planId, interval, isUpgrade } = await req.json();
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, plan_id')
      .eq('user_id', userId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Get the new price ID based on the plan and interval
    const newPriceId = interval === 'month' 
      ? plans.find(p => p.id === planId)?.stripePriceIdMonthly
      : plans.find(p => p.id === planId)?.stripePriceIdYearly;

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Invalid plan or interval' },
        { status: 400 }
      );
    }

    // Create a checkout session for the subscription update
    const session = await stripe.checkout.sessions.create({
      customer: subscription.stripe_customer_id as string,
      mode: 'subscription' as const,
      payment_method_types: ['card'] as const,
      line_items: [{
        price: newPriceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/upgrade?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/upgrade?canceled=true`,
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
        // If downgrading, schedule the change for the end of the period
        trial_end: !isUpgrade ? 'current_period_end' : undefined,
      },
    } as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 