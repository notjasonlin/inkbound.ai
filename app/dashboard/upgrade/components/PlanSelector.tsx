import React, { useState } from 'react';
import { Plan } from '../constants';
import { useInView } from 'react-intersection-observer';
import styles from '../styles/PlanSelector.module.css';

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan, interval: 'month' | 'year') => void;
  isLoading: boolean;
}

export default function PlanSelector({ 
  plans, 
  selectedPlan, 
  onSelectPlan,
  isLoading 
}: PlanSelectorProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div ref={ref} className="w-full h-full flex flex-col items-center">
      <h1 className={`text-4xl font-bold mb-4 ${styles.title}`}>
        Upgrade Your Account
      </h1>

      <h2 className={`text-3xl font-bold mb-6 ${styles.subtitle}`}>
        Pricing Plans
      </h2>

      <div className={`flex justify-center mb-8 bg-gray-200 rounded-full p-1 ${styles.intervalSelector}`}>
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
      
      <div className={`flex flex-col md:flex-row justify-center items-stretch space-y-6 md:space-y-0 md:space-x-6 px-4 mb-8 ${styles.planContainer}`}>
        {plans.map((plan, index) => {
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
                className={`mt-6 w-full px-4 py-2 ${selectedPlan?.id === plan.id ? 'bg-blue-700' : 'bg-blue-600'} text-white rounded-full hover:bg-blue-700 text-sm font-semibold`}
                onClick={() => onSelectPlan(plan, billingInterval)}
              >
                Choose {plan.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
