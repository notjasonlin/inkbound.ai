import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import WaitlistForm from './waitlistForm'; // Import the WaitlistForm component

const Hero: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-2 md:py-6 lg:px-10 bg-gradient-to-br from-blue-50 to-babyblue-100 space-y-12 md:space-y-16 relative overflow-hidden">
  {/* Floating Decorative Elements */}
  <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full blur-3xl opacity-50"></div>
  <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full blur-3xl opacity-50"></div>

  {/* Text and Image container */}
  <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-screen-2xl z-10">
    {/* Left Side - Text Content */}
    <motion.div
      className="w-full md:w-1/2 text-left space-y-4 md:space-y-6 flex flex-col items-center md:items-start"
      initial={{ opacity: 0, x: -100 }} // Slide in from left
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-5xl md:text-6xl font-bold text-babyblue-700 leading-snug text-center md:text-left">
        Welcome to Inkbound.ai!
      </h1>
      <p className="text-lg md:text-xl text-blue-900 max-w-lg text-center md:text-left">
        AI Coach for College Athletic Recruiting.
      </p>

      {/* Waitlist Button */}
      <motion.button
        onClick={toggleForm}
        className="bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg px-6 py-3 rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 active:scale-95"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Join the Waitlist!
      </motion.button>

      {/* Conditionally render the form */}
      {isFormVisible && (
        <motion.div
          className="mt-6 w-full max-w-md mx-auto md:mx-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Render WaitlistForm */}
          <WaitlistForm />
        </motion.div>
      )}
    </motion.div>

    {/* Right Side - Image */}
    <motion.div
      className="w-full md:w-1/2 mt-12 md:mt-0 md:pl-8 flex justify-center md:justify-end"
      initial={{ opacity: 0, x: 100 }} // Slide in from right
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Image
        className="rounded-lg shadow-2xl object-cover" // Reverted back to original style
        src="/inkbound-home-pic.png"
        alt="Inkbound Home"
        width={1200}  // Original size for large displays
        height={900}  // Original size for large displays
        priority={true}
      />
    </motion.div>
  </div>
</section>

  );
};

export default Hero;
