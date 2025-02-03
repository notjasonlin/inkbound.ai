/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { plans } from "@/app/dashboard/upgrade/constants";

export default function PricingSection() {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const handleToggle = () => {
    setBillingInterval((prev) => (prev === "monthly" ? "yearly" : "monthly"));
  };

  return (
    <section id="pricing" className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      {/* Background Blur Effect */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
      >
        <div
          className="mx-auto aspect-1155/678 w-[72.1875rem] bg-gradient-to-tr from-blue-400 to-blue-700 opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Header */}
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base font-semibold text-blue-600">Pricing</h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          Choose the right plan for you
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Select a plan tailored to your recruitment needs and budget, with features designed to simplify your process.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center items-center mt-10 space-x-4">
        <span className="font-medium text-gray-700">Monthly</span>
        <div
          className="relative w-14 h-7 flex items-center bg-gray-300 rounded-full cursor-pointer p-1"
          onClick={handleToggle}
        >
          <motion.div
            className="bg-white w-5 h-5 rounded-full shadow-md"
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            style={{
              marginLeft: billingInterval === "yearly" ? "auto" : "0",
            }}
          />
        </div>
        <span className="font-medium text-gray-700">Yearly</span>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
        {plans.map((plan, index) => {
          const price = billingInterval === "monthly" ? plan.priceMonthly : plan.priceYearly;
          const isFeatured = plan.id === "plus";
          const sizeClasses = [
            "p-6", // Basic (smallest)
            "p-8 scale-105", // Plus (medium size)
            "p-10 scale-110", // Pro (largest)
          ][index]; // Sizes grow progressively by index

          return (
            <motion.div
              key={plan.id}
              className={`
                relative flex flex-col rounded-xl shadow-lg text-center w-full 
                ${isFeatured ? "bg-blue-600 text-white" : "bg-white border border-gray-200"}
                ${sizeClasses}
                transition-transform duration-300 hover:shadow-2xl hover:scale-110
              `}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              {/* Plan Name */}
              <h3 className={`text-2xl font-bold ${isFeatured ? "text-white" : "text-blue-600"}`}>{plan.name}</h3>
              <p className={`mt-2 text-lg ${isFeatured ? "text-gray-200" : "text-gray-600"}`}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mt-4">
                <span className={`text-5xl font-extrabold ${isFeatured ? "text-white" : "text-blue-800"}`}>
                  {price === 0 ? "FREE" : `$${price}`}
                </span>
                {price !== 0 && (
                  <span className={`text-lg ${isFeatured ? "text-gray-200" : "text-gray-600"} ml-1`}>
                    / {billingInterval === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className={`mt-6 space-y-3 text-sm ${isFeatured ? "text-gray-200" : "text-gray-600"}`}>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center justify-center">
                    <CheckIcon className={`h-5 w-5 ${isFeatured ? "text-white" : "text-blue-600"} mr-2`} />
                    {feature}
                  </li>
                ))}
                {/* Additional Features */}
                <li className="flex items-center justify-center">
                  <CheckIcon className={`h-5 w-5 ${isFeatured ? "text-white" : "text-blue-600"} mr-2`} />
                  {plan.templateLimit >= 9999 ? "Unlimited templates" : `${plan.templateLimit} templates`}
                </li>
                <li className="flex items-center justify-center">
                  <CheckIcon className={`h-5 w-5 ${isFeatured ? "text-white" : "text-blue-600"} mr-2`} />
                  {plan.aiCallLimit >= 9999 ? "Unlimited AI calls" : `${plan.aiCallLimit} AI calls`}
                </li>
              </ul>

              {/* Call to Action Button */}
              <motion.button
                onClick={() => router.push("/login")}
                className={`
                  mt-6 px-6 py-3 font-semibold rounded-full shadow-md transition-transform
                  ${isFeatured ? "bg-white text-blue-600 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {plan.priceMonthly === 0 ? "Try Now" : `Choose ${plan.name}`}
              </motion.button>

              {/* Most Popular Tag */}
              {isFeatured && (
                <div className="absolute top-0 right-0 bg-black text-white text-xs px-3 py-1 rounded-bl-lg shadow-md uppercase">
                  Most Popular
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
