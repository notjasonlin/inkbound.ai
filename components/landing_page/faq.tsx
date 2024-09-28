import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Is this ethical?",
      answer: "Yes, our software follows the guidelines set by university and athletic recruitment policies.",
    },
    {
      question: "Can colleges tell if you used Inkbound?",
      answer: "No, your emails will be sent from your own personal email, ensuring a personalized and authentic experience.",
    },
    {
      question: "How does Inkbound help me get noticed?",
      answer: "Inkbound uses AI to curate personalized emails and school recommendations, ensuring you’re connecting with the right coaches and schools.",
    },
    {
      question: "Is there a trial available?",
      answer: "Yes, our Basic plan offers access to one school for free so you can experience how the software works.",
    },
    {
      question: "How secure is my personal data?",
      answer: "We prioritize data security and follow industry standards to ensure your personal information is protected."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-babyblue-200 w-full">
      <h2 className="text-4xl font-bold text-babyblue-700 text-center mb-10">Frequently Asked Questions</h2>
      <div className="space-y-6 max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-babyblue-300">
            <button
              onClick={() => toggleFAQ(index)}
              className={`w-full flex justify-between items-center py-4 text-left focus:outline-none transition-colors duration-300 ${
                openIndex === index ? 'text-blue-800' : 'text-gray-700'
              } hover:text-blue-600`}
            >
              <span className="text-lg font-semibold">{faq.question}</span>
              <span>
                {openIndex === index ? (
                  <FaChevronUp className="text-blue-600" />
                ) : (
                  <FaChevronDown className="text-blue-500" />
                )}
              </span>
            </button>
            <div
              className={`overflow-hidden transition ${
                openIndex === index ? 'max-h-screen py-4' : 'max-h-0'
              }`}
            >
              <div className="pl-6 pr-4 text-gray-600 rounded-md">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
