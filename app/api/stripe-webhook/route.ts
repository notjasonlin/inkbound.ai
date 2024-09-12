import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (endpointSecret) {
      // For production and CLI testing
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } else {
      // For local testing without CLI
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Checkout session completed:', JSON.stringify(session, null, 2));
    
    const userId = session.client_reference_id;
    const credits = session.metadata?.credits;

    console.log('User ID:', userId);
    console.log('Credits to add:', credits);

    if (!userId || !credits) {
      console.error('Missing userId or credits in session');
      return NextResponse.json({ error: 'Missing data in checkout session' }, { status: 400 });
    }

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Error fetching user credits:', error);
        return NextResponse.json({ error: 'Error fetching user credits' }, { status: 500 });
      }

      const currentCredits = data?.credits || 0;
      const newCredits = currentCredits + parseInt(credits);

      console.log('Current credits:', currentCredits);
      console.log('New total credits:', newCredits);

      const { error: updateError } = await supabase
        .from('user_credits')
        .upsert({ user_id: userId, credits: newCredits });

      console.log('Supabase update result:', { error: updateError });

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return NextResponse.json({ error: 'Error updating user credits' }, { status: 500 });
      }

      console.log('Credits updated successfully');
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Unexpected error:', error);
      return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}