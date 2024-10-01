import React from 'react';
import { motion } from 'framer-motion'; // For animations
import { useInView } from 'react-intersection-observer'; // For triggering animations on scroll

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
    title: "1 on 1 Calls with Current College Athletes",
    description: "Get inspired and informed by athletes who are currently playing at your dream school.",
    icon: "🏅",
  },
];

const Features = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,  // Trigger only once when entering the viewport
    threshold: 0.2,     // Trigger when 20% of the section is visible
  });

  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-br from-blue-50 to-babyblue-100 w-full relative overflow-hidden"
      ref={ref}  // Attach ref for intersection observer
    >
      {/* Floating Decorative Elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full blur-3xl opacity-50"></div>

      <h2 className="text-4xl font-bold text-babyblue-700 text-center mb-10">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white shadow-lg rounded-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 100 }}  // Initial hidden state
            animate={inView ? { opacity: 1, y: 0 } : {}}  // Trigger animation when in view
            transition={{ duration: 0.8, delay: index * 0.2 }}  // Add delay between each feature
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
