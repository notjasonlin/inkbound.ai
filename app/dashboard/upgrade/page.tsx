'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@/components/UserContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PlanSelector from './components/PlanSelector';
import UpgradeButton from './components/UpgradeButton';
import { Plan, plans } from './constants';
import { fetchOrCreateUserCredits } from './utils';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCredits, setCurrentCredits] = useState<number | null>(null);
  const { user } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchOrCreateUserCredits(supabase, user.id).then(setCurrentCredits);
    }
  }, [user]);

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
      <PlanSelector plans={plans} selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
      <UpgradeButton
        isLoading={isLoading}
        selectedPlan={selectedPlan}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}