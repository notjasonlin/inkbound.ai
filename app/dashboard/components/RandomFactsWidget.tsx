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
    const shuffledFacts = randomFacts.sort(() => 0.5 - Math.random());
    setVisibleFacts(shuffledFacts.slice(0, 2)); // Only show the first 2 facts
  };

  // Handle checking off a fact
  const checkOffFact = (fact: string) => {
    setCheckedFact(fact); // Trigger animation for checked fact

    // After animation, remove the checked fact and add a new one
    setTimeout(() => {
      setVisibleFacts((prevFacts) => {
        const newFacts = prevFacts.filter((f) => f !== fact);
        const remainingFacts = randomFacts.filter((f) => !newFacts.includes(f));
        const newRandomFact = remainingFacts[Math.floor(Math.random() * remainingFacts.length)];
        return [...newFacts, newRandomFact]; // Replace the checked fact with a new one
      });
      setCheckedFact(null); // Reset checked fact state
    }, 500); // Animation time
  };

  return (
    <div className="bg-white rounded-lg p-3" style={{ height: "100%" }}>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Random Facts & Tips</h2>
      <AnimatePresence>
        {visibleFacts.map((fact) => (
          <motion.div
            key={fact}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-2 bg-blue-50 p-2 rounded-md shadow-sm"
          >
            <p className="text-sm text-gray-700 font-bold">{fact}</p>
            <button
              onClick={() => checkOffFact(fact)}
              className="text-xs text-green-600 font-semibold hover:text-green-800 transition"
            >
              <FaCheckCircle />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
