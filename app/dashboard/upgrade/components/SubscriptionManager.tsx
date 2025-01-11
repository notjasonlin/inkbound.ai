import React, { useState } from 'react';
import { Plan, plans } from '../constants';
import styles from '../styles/PlanSelector.module.css';
import { useInView } from 'react-intersection-observer';

interface Props {
  currentSubscription: any;
  onManageSubscription: () => void;
  onChangePlan: (plan: Plan, interval: 'month' | 'year') => void;
}

export default function SubscriptionManager({ 
  currentSubscription, 
  onManageSubscription,
  onChangePlan
}: Props) {
  const [showPlans, setShowPlans] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const isActive = currentSubscription?.status === 'active';
  const currentPlanId = currentSubscription?.plan_id;

  const availablePlans = plans.filter(plan => {
    if (plan.id === currentPlanId) return false;
    if (currentPlanId !== 'free' && plan.id === 'free') return false;
    return true;
  });

  const handlePlanChange = async (plan: Plan, interval: 'month' | 'year') => {
    const isUpgrade = 
      (currentSubscription.plan_id === 'free' && ['plus', 'pro'].includes(plan.id)) ||
      (currentSubscription.plan_id === 'plus' && plan.id === 'pro');

    try {
      onChangePlan(plan, interval);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div ref={ref} className="w-full h-full flex flex-col items-center">
      <div className="flex space-x-4">
        {currentSubscription?.plan_id && ['plus', 'pro'].includes(currentSubscription.plan_id) && (
          <button
            onClick={onManageSubscription}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Manage Billing
          </button>
        )}
        <button
          onClick={() => setShowPlans(!showPlans)}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          {showPlans ? 'Hide Plans' : 'Change Plan'}
        </button>
      </div>

      {showPlans && (
        <>
          <div className={`flex justify-center mt-8 bg-gray-200 rounded-full p-1 ${styles.intervalSelector}`}>
            <button
              className={`px-6 py-2 rounded-full ${styles.intervalButton} ${
                billingInterval === 'month' ? 'bg-white text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setBillingInterval('month')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full ${styles.intervalButton} ${
                billingInterval === 'year' ? 'bg-blue-600 text-white' : 'text-gray-600'
              }`}
              onClick={() => setBillingInterval('year')}
            >
              Yearly
            </button>
          </div>

          <div className={`flex flex-col md:flex-row justify-center items-stretch space-y-6 md:space-y-0 md:space-x-6 px-4 mt-8 w-full ${styles.planContainer}`}>
            {availablePlans.map((plan, index) => {
              const bgColor = index === 0 ? 'bg-white' : index === 1 ? 'bg-blue-50' : 'bg-blue-100';
              const monthlyPrice = plan.name === 'Plus' ? 9 : plan.name === 'Pro' ? 29 : 0;
              const yearlyPrice = plan.name === 'Plus' ? 72 : plan.name === 'Pro' ? 240 : 0;
              const displayPrice = billingInterval === 'year' ? Math.floor(yearlyPrice / 12) : monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`${bgColor} p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between w-full md:w-1/3 ${styles.planCard}`}
                >
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <p className="text-4xl font-bold text-gray-800 flex items-baseline">
                        <span className="mr-1">
                          {monthlyPrice === 0 ? 'Free' : `$${displayPrice}`}
                        </span>
                        <span className="text-xl text-gray-600">/mo</span>
                      </p>
                      {monthlyPrice > 0 && billingInterval === 'year' && (
                        <p className={`text-sm text-gray-600 ${styles.yearlyPrice}`}>
                          ${yearlyPrice} billed annually
                        </p>
                      )}
                    </div>
                    <ul className="text-gray-600 space-y-2 mt-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2 text-sm">✔️</span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm font-semibold"
                    onClick={() => handlePlanChange(plan, billingInterval)}
                  >
                    Switch to {plan.name}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
} 