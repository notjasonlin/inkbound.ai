import React from 'react';
import { motion } from 'framer-motion'; // For animations

const features = [
  {
    title: "Email Assistant",
    description: "Send personalized emails to 500+ coaches with one click.",
    icon: "✉️",
  },
  {
    title: "School Suggestions",
    description: "Receive a curated list of schools that match your athletic and academic background, streamlining your search.",
    icon: "🎓",
  },
  {
    title: "AI Email Helper",
    description: "Get suggestions and autofilled emails to reach out and respond to coaches.",
    icon: "🤖",
  },
  {
    title: "College Coaches Contact Database",
    description: "Have access to every college coach's contact information in the country.",
    icon: "📇",
  },
  {
    title: "Progress Tracker",
    description: "Keep track of your entire recruitment communication progress in one dashboard.",
    icon: "📊",
  },
  {
    title: "1 on 1 Calls with current College Athletes",
    description: "Get inspired and informed by athletes who are currently playing at your dream school.",
    icon: "🏅",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-babyblue-100 w-full">
      <h2 className="text-4xl font-bold text-babyblue-700 text-center mb-10">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white shadow-lg rounded-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
