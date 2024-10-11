import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Use the latest API version
});

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { planId, userId } = await req.json();

      // Initialize Supabase client
      const supabase = createRouteHandlerClient({ cookies });

      // Fetch the user's data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      let customerId = userData?.stripe_customer_id;

      // If the user doesn't have a Stripe customer ID, create one
      if (!customerId) {
        const { data: { user } } = await supabase.auth.getUser();
        const customer = await stripe.customers.create({
          email: user?.email,
          metadata: { userId },
        });
        customerId = customer.id;

        // Save the Stripe customer ID to the user's record
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      }

      // Fetch the plan details
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('stripe_price_id')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // Create a Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: planData.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/upgrade`,
      });

      return NextResponse.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating subscription:', error);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
}