import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
  console.log('Received webhook request');
  console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers)));

  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 401 });
  }

  try {
    const rawBody = await req.text();
    console.log('Raw body length:', rawBody.length);
    console.log('Raw body preview:', rawBody.substring(0, 100));

    const stripeWebhookSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!;
    console.log('Webhook secret:', stripeWebhookSecret.slice(0, 5) + '...');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, stripeWebhookSecret);
      console.log('Stripe signature verified successfully');
    } catch (err: any) {
      console.error('Error verifying webhook signature:', err);
      return NextResponse.json({ error: 'Webhook signature verification failed: ' + err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const credits = parseInt(session.metadata?.credits || '0', 10);

      console.log('Processing checkout.session.completed', { userId, credits });

      if (userId && credits) {
        console.log('Adding credits to user', userId);
        const { data, error } = await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_credit_amount: credits
        });

        if (error) {
          console.error('Error adding credits:', error);
          return NextResponse.json({ error: 'Failed to add credits: ' + error.message }, { status: 500 });
        }

        console.log('Credits added successfully:', data);
        return NextResponse.json({ received: true, credits_added: credits, new_balance: data }, { status: 200 });
      } else {
        console.error('Missing userId or credits in session');
        return NextResponse.json({ error: 'Missing userId or credits' }, { status: 400 });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Webhook error: ' + err.message }, { status: 400 });
  }
}