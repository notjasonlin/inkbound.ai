"use client";

import { useState, useEffect } from "react";
import { randomFacts } from "../randomFacts"; // Import the facts file
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

export default function RandomFactsWidget() {
  const [visibleFacts, setVisibleFacts] = useState<string[]>([]);
  const [checkedFact, setCheckedFact] = useState<string | null>(null);

  useEffect(() => {
    showRandomFacts();
  }, []);

  // Show exactly 2 random facts
  const showRandomFacts = () => {
    // Shuffle and pick first 2
    const shuffled = [...randomFacts].sort(() => 0.5 - Math.random());
    setVisibleFacts(shuffled.slice(0, 2));
  };

  // Handle checking off a fact
  const checkOffFact = (fact: string) => {
    setCheckedFact(fact);

    // Wait for exit animation, then remove old fact & add new one
    setTimeout(() => {
      setVisibleFacts((prevFacts) => {
        const newFacts = prevFacts.filter((f) => f !== fact);
        const remainingFacts = randomFacts.filter((f) => !newFacts.includes(f));
        const newRandomFact =
          remainingFacts[Math.floor(Math.random() * remainingFacts.length)];
        return [...newFacts, newRandomFact];
      });
      setCheckedFact(null);
    }, 500);
  };

  return (
    <motion.div
      // Card fade/slide in animation
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        w-full
        bg-white
        border
        border-gray-200
        rounded-lg
        shadow-sm
        p-4
        flex
        flex-col
      "
      style={{ minHeight: "200px" }}
    >
      <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">
        Random Facts &amp; Tips
      </h2>

      <AnimatePresence>
        {visibleFacts.map((fact) => (
          <motion.div
            key={fact}
            className="
              relative
              mb-3
              bg-blue-50
              rounded-md
              shadow-sm
              p-3
              flex
              items-center
              justify-between
            "
            // Enter / Exit animations
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-gray-700 font-medium pr-2">
              {fact}
            </p>
            <button
              onClick={() => checkOffFact(fact)}
              className="
                flex
                items-center
                text-green-600
                hover:text-green-700
                transition
                ml-2
              "
              title="Mark this tip as complete"
            >
              <FaCheckCircle size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
