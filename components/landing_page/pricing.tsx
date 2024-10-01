import React from 'react';
import { motion } from 'framer-motion'; // For adding animation

const pricingPlans = [
  {
    title: "Basic",
    price: "Free",
    description: "You'll want to upgrade soon 😉",
    features: [
      "Access to 1 school",
      "Basic support",
      "Limited email templates",
    ],
    bgColor: "bg-babyblue-50",
  },
  {
    title: "Plus",
    price: "$10",
    description: "For up to 20 schools",
    features: [
      "Access to 20 schools",
      "Priority support",
      "Advanced email templates",
    ],
    bgColor: "bg-babyblue-100",
  },
  {
    title: "Pro",
    price: "$25",
    description: "Unlimited schools access",
    features: [
      "Unlimited schools",
      "24/7 premium support",
      "Custom email templates",
      "Personalized advice",
    ],
    bgColor: "bg-babyblue-200",
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-r from-blue-50 to-babyblue-100 w-full">
      <h2 className="text-4xl font-bold text-babyblue-700 text-center mb-10">Pricing Plans</h2>
      <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8 max-w-6xl mx-auto px-4">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={index}
            className={`${plan.bgColor} p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center w-full md:w-1/3`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-2">{plan.title}</h3>
            <p className="text-lg text-gray-600 mb-4">{plan.description}</p>
            <p className="text-4xl font-bold text-babyblue-700 mb-4">{plan.price}</p>
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
              Choose {plan.title}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
