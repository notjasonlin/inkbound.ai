'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@/components/UserContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Plan = { credits: number; price: number; savings: number };

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans: Plan[] = [
  { credits: 100, price: 20, savings: 0 },
  { credits: 200, price: 25, savings: 15 },
  { credits: 300, price: 30, savings: 30 },
];

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCredits, setCurrentCredits] = useState<number | null>(null);
  const { user } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log('Current user:', user);
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCurrentCredits(data?.credits || 0);
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const handleUpgrade = async () => {
    console.log('handleUpgrade called', { selectedPlan, user });
    if (!selectedPlan || !user) return;
    console.log('handleUpgrade function called');
    console.log('Selected plan:', selectedPlan);
    console.log('User:', user);

    setIsLoading(true);
    
    try {
      console.log('Sending request to create checkout session');
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credits: selectedPlan.credits,
          userId: user.id
        }),
      });
      console.log('Response received:', response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('Response data:', data);

      const { id: sessionId } = data;
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      
      console.log('Redirecting to Stripe checkout');
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upgrade Your Account</h1>
      {currentCredits !== null && (
        <p className="text-xl mb-6">Your current credit balance: {currentCredits} credits</p>
      )}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.credits}
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              selectedPlan === plan ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:shadow-md'
            }`}
            onClick={() => {
              setSelectedPlan(plan);
              console.log('Plan selected:', plan);
            }}
          >
            <h2 className="text-2xl font-bold mb-2">{plan.credits} Credits</h2>
            <p className="text-3xl font-bold text-blue-600 mb-2">${plan.price}</p>
            {plan.savings > 0 && (
              <p className="text-green-600 mb-2">Save ${plan.savings}</p>
            )}
            <p className="text-gray-600">
              ${(plan.price / plan.credits).toFixed(2)} per credit
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={handleUpgrade}
        disabled={isLoading || !selectedPlan}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition duration-200 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : selectedPlan ? `Purchase ${selectedPlan.credits} Credits` : 'Select a plan'}
      </button>
    </div>
  );
}