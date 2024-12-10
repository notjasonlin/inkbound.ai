import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { plans } from '@/app/dashboard/upgrade/constants';
import { webhookHeaders } from '@/utils/api-headers';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing data');
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 401 });
  }

  try {
    const rawBody = await req.text();

    const stripeWebhookSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!;

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, stripeWebhookSecret);
    } catch (err: any) {
      console.error('Error verifying data:', err);
      return NextResponse.json({ error: 'Webhook signature verification failed: ' + err.message }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      // Add more cases as needed
    }

    return NextResponse.json(
      { received: true }, 
      { status: 200, headers: webhookHeaders }
    );
  } catch (err: any) {
    console.error('Error processing data:', err);
    return NextResponse.json({ error: 'Webhook error: ' + err.message }, { status: 400 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription as string;

  if (userId && subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await updateUserSubscription(userId, subscription);
  } else {
    console.error('Missing data');
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (userId) {
    await updateUserSubscription(userId, subscription);
  } else {
    console.error('Missing data');
  }
}

async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id;
  const plan = plans.find(p => p.stripePriceIdMonthly === priceId || p.stripePriceIdYearly === priceId);

  if (!plan) {
    console.error('No matching plan found for priceId:', priceId);
    return;
  }

  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: subscription.id as string,
    stripe_customer_id: subscription.customer as string,
    plan_id: plan.id as string,
    plan_name: plan.name as string,
    status: subscription.status as string,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    ai_call_limit: plan.aiCallLimit as number,
    schools_sent_limit: plan.schoolLimit as number,
    template_limit: plan.templateLimit as number,
    updated_at: new Date().toISOString()
  };

  console.log('Attempting to upsert subscription data:', subscriptionData);

  const { data: subData, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData)
    .select();

  if (subscriptionError) {
    console.error('Subscription update error:', subscriptionError);
  } else {
    console.log('Subscription update successful:', subData);
  }
}
