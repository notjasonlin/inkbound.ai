'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PlanSelector from './components/PlanSelector';
import SubscriptionManager from './components/SubscriptionManager';
import { Plan, plans } from './constants';
import { fetchUserSubscription, fetchUserUsage } from './utils';
import UsageDisplay from '@/components/UsageDisplay';
import SubscriptionUsage from './components/SubscriptionUsage';

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
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to create portal session');
      
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {currentSubscription && userUsage && (
        <SubscriptionUsage
          plan={currentSubscription?.plan_name}
          status={currentSubscription?.status}
          aiCalls={{ used: userUsage?.ai_calls_used || 0, total: currentSubscription?.ai_call_limit || 0 }}
          schools={{ used: userUsage?.schools_sent || 0, total: currentSubscription?.schools_sent_limit || 0 }}
          templates={{ used: userUsage?.templates_used || 0, total: currentSubscription?.template_limit || 0 }}
          periodEnd={currentSubscription?.current_period_end}
        />
      )}
      
      {currentSubscription?.status === 'active' ? (
        <SubscriptionManager
          currentSubscription={currentSubscription}
          onManageSubscription={handleManageSubscription}
          onChangePlan={handleUpgrade}
        />
      ) : (
        <PlanSelector 
          plans={plans} 
          selectedPlan={selectedPlan} 
          onSelectPlan={(plan, interval) => {
            setSelectedPlan(plan);
            handleUpgrade(plan, interval);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
