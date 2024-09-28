import React from 'react';
import { motion } from 'framer-motion';
import { Shrikhand } from 'next/font/google';

const shrikhand = Shrikhand({ subsets: ['latin'], weight: '400' });

const About = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-babyblue-100 w-full">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        
        {/* Heading */}
        <motion.h2
          className={`text-4xl font-bold text-babyblue-700`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          About Us
        </motion.h2>

        {/* Introduction Text */}
        <motion.p
          className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          At Inkbound.ai, we are passionate about simplifying the college recruiting process. 
          Our mission is to make it more accessible and affordable for athletes to connect with the right opportunities.
          Whether you're looking to join a D1 powerhouse or an academically prestigious D3, we've been through the process ourselves 
          and understand what it takes.
        </motion.p>

        {/* Founders Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Founder 1 */}
          <motion.div
            className="bg-babyblue-200 shadow-lg rounded-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <motion.img
              src="/Gaby_About.jpg" // Replace with actual image path
              alt="Cofounder Image 1"
              className="rounded-full w-48 h-48 mx-auto shadow-xl"
              whileHover={{ scale: 1.05 }}
            />
            <h3 className="text-2xl font-semibold mt-6 text-gray-800">Gabriel Diaz</h3>
            <p className="text-gray-600 mt-2">
              Current UChicago Men's Soccer player. Deeply passionate about helping athletes like him navigate the college recruiting process.
            </p>
          </motion.div>

          {/* Founder 2 */}
          <motion.div
            className="bg-babyblue-200 shadow-lg rounded-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
          >
         <motion.img
            src="/Elan_About.jpg"  // Replace with the actual path to your image
            alt="Cofounder Image 1"
            className="rounded-full w-48 h-48 mx-auto shadow-lg object-cover object-center"
            whileHover={{ scale: 1.05 }}
            />

            <h3 className="text-2xl font-semibold mt-6 text-gray-800">Elan Romo</h3>
            <p className="text-gray-600 mt-2">
              Current Brandeis Men's Soccer player. Focused on making recruiting easier for student-athletes through cutting-edge technology.
            </p>
          </motion.div>
        </motion.div>

        {/* Final Text */}
        <motion.p
          className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          As former recruits and current players, we know how difficult and stressful the process can be. 
          That's why we created Inkbound.ai — to give every aspiring college athlete the tools they need to succeed.
        </motion.p>
      </div>
    </section>
  );
};

export default About;
