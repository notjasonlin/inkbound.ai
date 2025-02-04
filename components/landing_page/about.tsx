/* eslint-disable @next/next/no-img-element */

"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AboutTheFounders() {
  return (
    <section id="about-us" className="relative bg-white py-24 sm:py-32 lg:py-36">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.h2
          className="text-base font-semibold text-blue-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About The Founders
        </motion.h2>
        <motion.p
          className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Built by Student-Athletes, For Student-Athletes
        </motion.p>
        <motion.p
          className="mt-6 text-lg text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Learn more about how Inkbound.ai came to life.
        </motion.p>
      </div>

      {/* Content */}
      <div className="mt-16 lg:mt-20 max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          className="space-y-8 text-gray-600 text-lg leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
          }}
        >
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            The idea of Inkbound.ai was born from our own experience navigating
            the competitive landscape of college athletics recruitment. Just a
            few years ago, we were in your shoes—looking for a way to stand out,
            connect with the right coaches, and make the most of our athletic
            potential.
          </motion.p>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            Like many student-athletes, we found that most of the resources out
            there were either way too expensive or didn't offer the personalized
            guidance we needed. We often wished there was something affordable,
            simple, and actually helpful to make the recruitment process easier.
          </motion.p>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            That's why we created Inkbound.ai—to solve the problems we faced.
            Our AI-driven platform helps athletes like you get noticed without
            breaking the bank. Whether you're aiming for D1 athletics or
            balancing academics and sports at a D3 school, we're here to help
            you connect with the right opportunities.
          </motion.p>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            Over the past year, we've worked tirelessly to build a platform that
            meets the real needs of student-athletes. By bridging the gap
            between athletes and coaches with modern tools and data-driven
            insights, we believe the future of recruitment should be accessible
            to all.
          </motion.p>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            We created Inkbound.ai because we knew there had to be a better way.
            Now, we're here to make sure the process is smoother, more
            transparent, and more affordable for you.
          </motion.p>
          <motion.p
            className="text-right text-gray-900 font-semibold"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            - Elan, Gabriel, Jason, & John
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
