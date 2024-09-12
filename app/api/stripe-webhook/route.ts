import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');

  console.log('Received webhook request');
  console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers)));

  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 401 });
  }

  try {
    const body = await req.text();
    console.log('Webhook body:', body);
    const stripeWebhookSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!;
    
    console.log('Verifying Stripe signature...');
    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    console.log('Stripe signature verified successfully');

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