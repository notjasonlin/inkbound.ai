import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const signature = req.headers['stripe-signature'] as string;


  if (!signature) {
    console.error('Error fetching data');
    return res.status(401).json({ error: 'Missing Stripe signature' });
  }

  try {
    const body = await buffer(req);
    const stripeWebhookSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!;
    
    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const credits = parseInt(session.metadata?.credits || '0', 10);


      if (userId && credits) {
        const { data, error } = await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_credit_amount: credits
        });

        if (error) {
          console.error('Error fetching data', error);
          return res.status(500).json({ error: 'Failed to add credits: ' + error.message });
        }

        return res.status(200).json({ received: true, credits_added: credits, new_balance: data });
      } else {
        console.error('Error fetching data');
        return res.status(400).json({ error: 'Missing userId or credits' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Error fetching data', err);
    return res.status(400).json({ error: 'Webhook error: ' + err.message });
  }
}

// Helper function to parse the request body
async function buffer(req: VercelRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

