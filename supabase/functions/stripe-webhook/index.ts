import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'

// This line is crucial for bypassing the default authorization
serve.default.options.onError = (error) => {
  console.error('Error in Edge Function:', error);
  return new Response('Internal Server Error', { status: 500 });
};

const stripe = new Stripe(Deno.env.get('NEXT_PUBLIC_STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
})

const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPANEXT_PUBLIC_BASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  console.log('Received webhook request')
  console.log('Headers:', JSON.stringify(req.headers))

  if (!signature) {
    console.error('Missing Stripe signature')
    return new Response('Missing Stripe signature', { status: 401 })
  }

  try {
    const body = await req.text()
    console.log('Webhook body:', body)
    const stripeWebhookSecret = Deno.env.get('NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET')!
    
    console.log('Verifying Stripe signature...')
    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    console.log('Stripe signature verified successfully')

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id
      const credits = parseInt(session.metadata?.credits || '0', 10)

      console.log('Processing checkout.session.completed', { userId, credits })

      if (userId && credits) {
        console.log('Adding credits to user', userId);
        const { data, error } = await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_credit_amount: credits
        });

        if (error) {
          console.error('Error adding credits:', error);
          return new Response(JSON.stringify({ error: 'Failed to add credits: ' + error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        console.log('Credits added successfully:', data);
        return new Response(JSON.stringify({ received: true, credits_added: credits, new_balance: data }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        console.error('Missing userId or credits in session')
        return new Response(JSON.stringify({ error: 'Missing userId or credits' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(
      JSON.stringify({ error: 'Webhook error: ' + err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
