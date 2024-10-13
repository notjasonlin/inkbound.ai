'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PlanSelector from './components/PlanSelector';
import { Plan, plans } from './constants';
import { fetchUserSubscription, fetchUserUsage } from './utils';
import UsageDisplay from '@/components/UsageDisplay';

interface Usage {
  user_id: string;
  ai_call_limit: number;
  schools_sent_limit: number;
  template_limit: number;
  ai_calls_used: number;
  schools_sent: number;
  templates_used: number;
}

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [userUsage, setUserUsage] = useState<Usage | null>(null);
  const { user } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchUserSubscription(supabase, user.id).then(setCurrentSubscription);
      fetchUserUsage(supabase, user.id).then(setUserUsage);
    }
  }, [user]);

  const handleUpgrade = async (plan: Plan, interval: 'month' | 'year') => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: plan.id,
          userId: user.id,
          interval
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      window.location.href = data.url;
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
      {currentSubscription && userUsage && (
        <UsageDisplay subscription={currentSubscription} usage={userUsage} />
      )}
      <PlanSelector 
        plans={plans} 
        selectedPlan={selectedPlan} 
        onSelectPlan={(plan, interval) => {
          setSelectedPlan(plan);
          handleUpgrade(plan, interval);
        }} 
      />
    </div>
  );
}
