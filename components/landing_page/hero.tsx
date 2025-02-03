/* eslint-disable @next/next/no-img-element */

"use client";

import React from "react";
import { motion } from "framer-motion";
import LoginButton from "../LoginLogoutButton";

export default function Hero() {
  return (
    <section
      className="
        relative 
        w-full 
        overflow-hidden 
        bg-white 
        py-20  
        sm:py-28  
        lg:py-32  
      "
    >
      {/* Grid Background with Top-Right Fade */}
      <div
        className="
          absolute 
          inset-0 
          h-full 
          w-full 
          bg-white 
          bg-[linear-gradient(to_right,#8080801A_1px,transparent_1px),linear-gradient(to_bottom,#8080801A_1px,transparent_1px)] 
          bg-[size:190px_190px]
          [mask-image:radial-gradient(ellipse_75%_75%_at_100%_0%,#000_50%,transparent_100%)] 
          [mask-size:cover] 
          [mask-repeat:no-repeat]
          [webkit-mask-image:radial-gradient(ellipse_75%_75%_at_100%_0%,#000_50%,transparent_100%)]
          [webkit-mask-size:cover] 
          [webkit-mask-repeat:no-repeat]
        "
      ></div>

      {/* Main Container */}
      <div
        className="
          relative  
          z-10 
          flex 
          w-full 
          flex-col 
          items-start 
          pl-20  
          sm:pl-20
          md:flex-row 
          md:justify-between
        "
      >
        {/* Left Section with Motion */}
        <motion.div
          className="max-w-2xl space-y-8 py-24 sm:py-24 lg:py-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.2, duration: 0.8, ease: "easeOut" },
            },
          }}
        >
          {/* Logo */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="mb-6"
          >
            <img
              src="/inkbound-mini-logo.png"
              alt="Inkbound Logo"
              className="h-10 w-auto sm:h-12"
            />
          </motion.div>

          {/* "What’s new" badge + v1.0 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="mb-6 flex items-center space-x-2"
          >
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              What’s new
            </span>
            <span className="text-sm text-gray-500">v1.0 out now! &rarr;</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="
              text-4xl  
              font-bold 
              tracking-tight 
              text-gray-900 
              sm:text-5xl 
              lg:text-6xl
            "
          >
            Welcome to Inkbound AI<br className="hidden sm:block" />
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl md:max-w-md"
          >
            Your personal AI College Recruiting Coach
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col items-start gap-4 sm:flex-row"
          >
            <LoginButton
              label="Get started"
              className="
                inline-block 
                rounded-md 
                bg-blue-600 
                px-6 
                py-3 
                text-sm 
                font-medium 
                text-white 
                shadow 
                hover:bg-blue-500 
                focus:outline-none 
                focus:ring-2 
                focus:ring-indigo-600 
                focus:ring-offset-2
                transition-transform 
                transform 
                hover:scale-105 
                active:scale-95
              "
            />

            <a
              href="#"
              className="
                inline-block 
                text-sm 
                font-medium 
                text-indigo-600 
                hover:text-indigo-500
              "
            >
              Learn more &rarr;
            </a>
          </motion.div>
        </motion.div>

        {/* Right Section: Updated Image */}
        <div className="relative hidden w-full max-w-sm sm:max-w-md md:block lg:max-w-lg">
          <div
            className="
              absolute 
              -right-0 
              top-0
              md:-top-10
              h-auto 
              w-[400px] sm:w-[440px] lg:w-[460px] 
              transform 
              rounded-2xl 
              overflow-hidden 
              border border-gray-300 
              shadow-lg
            "
          >
            <img
              src="/test-image.png"
              alt="Test Image"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
