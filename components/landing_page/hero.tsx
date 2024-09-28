import React from 'react';
import { motion } from 'framer-motion'; // For animations
import Image from 'next/image'; // Assuming you're using Next.js for image optimization
import LoginButton from '@/components/LoginLogoutButton'; // Adjust the import based on your file structure

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-20 py-16 bg-gradient-to-r from-blue-50 to-babyblue-100">
      {/* Left Side - Text Content */}
      <motion.div
        className="w-full md:w-1/2 text-left space-y-6 md:pr-8" // Add padding-right (pr-8) for spacing on larger screens
        initial={{ opacity: 0, x: -100 }} // Slide in from left
        animate={{ opacity: 1, x: 0 }} // Fade in and stop at original position
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-babyblue-700">
          Welcome to Inkbound.ai!
        </h1>
        <p className="text-lg md:text-xl text-blue-900 max-w-lg">
          College athletic recruitment AI.
        </p>

        {/* Login Button with animation */}
        <motion.div
          className="mt-6 w-full md:w-1/2 lg:w-1/3"
          whileHover={{ scale: 1.05 }} // Hover animation
          whileTap={{ scale: 0.95 }} // Press down animation
        >
          <LoginButton label="Try it out now!" />
        </motion.div>
      </motion.div>

      {/* Right Side - Image */}
      <motion.div
        className="w-full max-w-xxl mt-10 md:mt-0 md:pl-8" // Add padding-left (pl-8) for spacing on larger screens
        initial={{ opacity: 0, x: 100 }} // Slide in from right
        animate={{ opacity: 1, x: 0 }} // Fade in and stop at original position
        transition={{ duration: 0.8 }}
      >
        <Image
          className="rounded-lg shadow-xl"
          src="/inkbound-home.png" // Path to your image in the public folder
          alt="Inkbound Home"
          width={1000}
          height={800}
          priority={true} // Loads the image quickly
        />
      </motion.div>
    </section>
  );
};

export default Hero;
