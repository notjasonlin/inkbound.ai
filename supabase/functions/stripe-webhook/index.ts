import express from 'express';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPANEXT_PUBLIC_BASE_URL!;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  console.log('Received webhook request');
  console.log('Headers:', JSON.stringify(req.headers));

  if (!signature) {
    console.error('Missing Stripe signature');
    return res.status(401).send('Missing Stripe signature');
  }

  try {
    const body = req.body;
    console.log('Webhook body:', body.toString());
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
          return res.status(500).json({ error: 'Failed to add credits: ' + error.message });
        }

        console.log('Credits added successfully:', data);
        return res.status(200).json({ received: true, credits_added: credits, new_balance: data });
      } else {
        console.error('Missing userId or credits in session');
        return res.status(400).json({ error: 'Missing userId or credits' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(400).json({ error: 'Webhook error: ' + err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

