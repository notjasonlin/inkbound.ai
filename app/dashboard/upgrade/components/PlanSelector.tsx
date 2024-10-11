import React, { useState } from 'react';
import { Plan } from '../constants';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type PlanSelectorProps = {
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan, interval: 'month' | 'year') => void;
};

export default function PlanSelector({ plans, selectedPlan, onSelectPlan }: PlanSelectorProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div ref={ref} className="w-full h-full flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4">Upgrade Your Account</h1>
      <h2 className="text-3xl font-bold mb-6">Pricing Plans</h2>
      <div className="flex justify-center mb-8 bg-gray-200 rounded-full p-1">
        <button
          className={`px-6 py-2 rounded-full ${billingInterval === 'month' ? 'bg-white text-blue-600' : 'text-gray-600'}`}
          onClick={() => setBillingInterval('month')}
        >
          Monthly
        </button>
        <button
          className={`px-6 py-2 rounded-full ${billingInterval === 'year' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          onClick={() => setBillingInterval('year')}
        >
          Yearly
        </button>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch space-y-6 md:space-y-0 md:space-x-6 px-4 mb-8">
        {plans.map((plan, index) => {
          const monthlyPrice = billingInterval === 'month' ? plan.price : plan.price * 10 / 12;
          const yearlyPrice = plan.price * 10;
          const bgColor = index === 0 ? 'bg-white' : index === 1 ? 'bg-blue-50' : 'bg-blue-100';

          return (
            <motion.div
              key={plan.id}
              className={`${bgColor} p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between w-full md:w-1/3`}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div>
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <div className="h-15"> {/* Fixed height container for price */}
                  <p className="text-4xl font-bold text-gray-800 mb-1">
                    <span className="inline-block w-32">
                      {plan.price === 0 ? 'Free' : `$${monthlyPrice.toFixed(2)}`}
                    </span>
                    <span className={`text-xl ${billingInterval === 'month' ? 'invisible' : ''}`}>/month</span>
                  </p>
                  {plan.price > 0 && (
                    <p className="text-sm text-gray-600 mb-4 h-5">
                      {billingInterval === 'year' ? `$${yearlyPrice.toFixed(2)} billed annually` : '\u00A0'}
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
                onClick={() => onSelectPlan(plan, billingInterval)}
              >
                Choose {plan.name}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
