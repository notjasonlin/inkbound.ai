'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@/components/UserContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PlanSelector from './components/PlanSelector';
import UpgradeButton from './components/UpgradeButton';
import { Plan, plans } from './constants';
import { fetchUserSubscription } from './utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const { user } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchUserSubscription(supabase, user.id).then(setCurrentSubscription);
    }
  }, [user]);

  const handleUpgrade = async () => {
    if (!selectedPlan || !user) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: selectedPlan.id,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      const { sessionId } = data;
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      // Show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upgrade Your Account</h1>
      {currentSubscription && (
        <p className="text-xl mb-6">Your current plan: {currentSubscription.plan_name}</p>
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
