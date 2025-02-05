/* eslint-disable @next/next/no-img-element */

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  EnvelopeOpenIcon,
  AcademicCapIcon,
  CpuChipIcon,
  NumberedListIcon,
  PhoneIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Email Assistant",
    description:
      "Send personalized emails to hundreds of coaches in seconds.",
    icon: EnvelopeOpenIcon,
  },
  {
    name: "School Suggestions",
    description:
      "Receive curated school recommendations that match your academic and athletic background.",
    icon: AcademicCapIcon,
  },
  {
    name: "AI Email Helper",
    description:
      "Get suggestions and autofilled emails to reach out and respond to coaches.",
    icon: CpuChipIcon,
  },
  {
    name: "Progress Tracker",
    description:
      "Track your entire recruitment communication progress in one dashboard.",
    icon: NumberedListIcon,
  },
  {
    name: "College Coaches Contact Database",
    description:
      "Have access to every college coach's contact information in the country.",
    icon: UsersIcon,
  },
  {
    name: "1 on 1 Calls with Current College Athletes",
    description:
      "Get inspired and informed by athletes who are currently playing at your dream school.",
    icon: PhoneIcon,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative bg-white py-24 sm:py-32 lg:py-36">
      {/* Top Tagline */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.h2
          className="text-base font-semibold text-blue-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Transform the way you connect with college coaches
        </motion.h2>
        <motion.p
          className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Email hundreds of college coaches in seconds
        </motion.p>
        <motion.p
          className="mt-6 text-lg text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Inkbound saves you hours of time and energy by automating the most
          challenging parts of the recruiting process. From creating email
          templates to tracking progress, we guide you step by step.
        </motion.p>
      </div>

      {/* Features Grid */}
      <div className="mt-16 lg:mt-20 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.dl
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.3 } },
          }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              className="relative pl-16"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <dt className="text-lg font-semibold text-gray-900">
                <div className="absolute top-0 left-0 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <feature.icon
                    aria-hidden="true"
                    className="h-6 w-6 text-white"
                  />
                </div>
                {feature.name}
              </dt>
              <dd className="mt-2 text-base text-gray-600">
                {feature.description}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
