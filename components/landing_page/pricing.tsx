"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { plans } from '@/app/dashboard/upgrade/constants';

const Pricing = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const handleToggle = () => {
    setBillingInterval(prev => (prev === 'monthly' ? 'yearly' : 'monthly'));
  };

  return (
    <section
      id="pricing"
      className="py-20 bg-gradient-to-r from-blue-50 to-babyblue-100 w-full"
      ref={ref}
    >
      <h2 className="text-4xl font-bold text-babyblue-700 text-center mb-10">Pricing Plans</h2>

      {/* Billing Interval Toggle */}
      <div className="flex justify-center items-center mb-8">
        <button 
          onClick={handleToggle} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-transform duration-300"
        >
          {billingInterval === 'monthly' ? 'Switch to Yearly Billing' : 'Switch to Monthly Billing'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8 max-w-6xl mx-auto px-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            className={`p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center w-full md:w-1/3 ${index === 0 ? 'bg-babyblue-50' : index === 1 ? 'bg-babyblue-100' : 'bg-babyblue-200'}`}
            initial={{ opacity: 0, y: 100 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-lg text-gray-600 mb-4">{plan.description}</p>
            <p className="text-4xl font-bold text-babyblue-700 mb-4">
              {billingInterval === 'monthly' ? `$${plan.priceMonthly}` : `$${plan.priceYearly}`}
              <span className="text-lg text-gray-600"> / {billingInterval === 'monthly' ? 'month' : 'year'}</span>
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex justify-center items-center">
                  <span className="text-babyblue-700">✔️</span>
                  <span className="ml-2">{feature}</span>
                </li>
              ))}
            </ul>
            <motion.button
              className="px-6 py-2 bg-babyblue-600 text-white rounded-lg hover:bg-babyblue-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Choose {plan.name}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
