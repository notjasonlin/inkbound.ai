"use client";

import React, { useState } from "react";
import { motion } from "framer-motion"; // Import framer-motion for animations
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Is this ethical?",
      answer:
        "Yes, our software follows the guidelines set by university and athletic recruitment policies. We ensure that athletes maintain full control of their communication and adhere to all NCAA or NAIA rules. This way, your recruitment process remains transparent and compliant.",
    },
    {
      question: "Can colleges tell if you used Inkbound?",
      answer:
        "No, your emails are sent from your personal Gmail account, giving you full control over the content. Inkbound offers guidance, but you own the communication. Coaches value genuine outreach, and Inkbound ensures your messages reflect your authentic voice.",
    },
    {
      question: "How does Inkbound help me get noticed?",
      answer:
        "Inkbound uses AI to generate personalized emails tailored to the preferences of each school’s coaching staff. Additionally, our recommendation engine suggests schools that match your academic, athletic, and geographical preferences, increasing your chances of making meaningful connections.",
    },
    {
      question: "Is there a trial available?",
      answer:
        "Yes, we offer a Basic plan that allows you to access and contact one school for free. This gives you the chance to try out our platform and understand how Inkbound can enhance your recruitment efforts before committing to a paid plan.",
    },
    {
      question: "How secure is my personal data?",
      answer:
        "We take data security seriously and have passed Google's rigorous CASA Tier 2 Security Assessment. As a Google-approved website, your personal information is protected with industry-standard encryption. We don't read or access your emails—everything is securely transmitted directly between you and the coaches.",
    },
    {
      question: "What if I don't know which schools to target?",
      answer:
        "Inkbound provides personalized school suggestions based on your athletic profile, academic standing, and preferences. Our AI engine can also help you identify schools that might not be on your radar but align well with your goals.",
    },
    {
      question: "How does the AI help with my communication?",
      answer:
        "Our AI-driven assistant offers templates and suggestions tailored to each specific coach and school, ensuring your emails are both professional and relevant. It also helps you track your progress and follow up with coaches at the right time, so no opportunity slips through the cracks.",
    },
    {
      question: "Can I customize the email templates?",
      answer:
        "Yes! While our templates are designed to help you craft the perfect message, you can edit them to match your tone and style. This allows you to maintain a personal touch while benefiting from the AI’s recommendations.",
    },
    {
      question: "How often should I email coaches?",
      answer:
        "Coaches appreciate persistence but dislike being overwhelmed. We recommend an initial email, followed by a polite follow-up every few weeks if you haven't received a response. Inkbound will help you track your communication and suggest the best times to reach out again.",
    },
    {
      question: "Do I need to pay to contact multiple schools?",
      answer:
        "While our Basic plan offers access to one school for free, you can unlock more schools with our affordable paid plans. These plans are designed to give you the flexibility to contact multiple schools based on your recruitment goals.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-20 w-full bg-white text-gray-800"
    >
      <motion.h2
        className="text-center text-4xl md:text-5xl font-bold text-gray-900 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Frequently Asked Questions
      </motion.h2>

      <div className="space-y-8 max-w-4xl mx-auto px-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="border-b border-blue-200 pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
          >
            {/* Question Button */}
            <button
              onClick={() => toggleFAQ(index)}
              className={`w-full flex justify-between items-center py-4 text-left text-lg font-medium ${
                openIndex === index ? "text-blue-700" : "text-gray-800"
              } transition-colors duration-300 hover:text-blue-600`}
            >
              {faq.question}

              {/* Animated Chevron */}
              <motion.div
                className="ml-2"
                initial={false}
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {openIndex === index ? (
                  <FaChevronUp className="text-blue-600" />
                ) : (
                  <FaChevronDown className="text-blue-500" />
                )}
              </motion.div>
            </button>

            {/* Answer Section */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
                openIndex === index ? "max-h-[300px]" : "max-h-0"
              }`}
            >
              <motion.div
                className="pl-6 text-base text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {faq.answer}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
