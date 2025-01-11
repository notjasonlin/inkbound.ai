'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PlanSelector from './components/PlanSelector';
import SubscriptionManager from './components/SubscriptionManager';
import { Plan, plans } from './constants';
import { fetchUserSubscription, fetchUserUsage } from './utils';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  const [isUsageExpanded, setIsUsageExpanded] = useState(false);
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
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Your Subscription</h1>
          <p className="text-lg text-gray-600">
            Current Plan: <span className="font-semibold">{currentSubscription?.plan_name || 'Basic Plan'}</span>
          </p>
        </div>

        {currentSubscription && userUsage && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setIsUsageExpanded(!isUsageExpanded)}
              className="w-full px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Subscription and Usage</h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  currentSubscription?.status === 'active' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {currentSubscription?.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              {isUsageExpanded ? 
                <FaChevronUp className="text-gray-400 h-5 w-5" /> : 
                <FaChevronDown className="text-gray-400 h-5 w-5" />
              }
            </button>
            
            {isUsageExpanded && (
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-900 font-medium">AI Calls</span>
                      <div className="text-sm text-gray-500">Monthly limit</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">{userUsage.ai_calls_used}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-900">{currentSubscription.ai_call_limit}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-900 font-medium">Schools Sent</span>
                      <div className="text-sm text-gray-500">Monthly limit</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">{userUsage.schools_sent}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-900">{currentSubscription.schools_sent_limit}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-900 font-medium">Templates Used</span>
                      <div className="text-sm text-gray-500">Total limit</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">{userUsage.templates_used}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-900">{currentSubscription.template_limit}</span>
                    </div>
                  </div>
                  {currentSubscription.current_period_end && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Current Period Ends</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(currentSubscription.current_period_end).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
      </div>
    </div>
  );
}
