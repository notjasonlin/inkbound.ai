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
      answer: "Yes, our software follows the guidelines set by university and athletic recruitment policies. We ensure that athletes maintain full control of their communication and adhere to all NCAA or NAIA rules. This way, your recruitment process remains transparent and compliant."
    },
    {
      question: "Can colleges tell if you used Inkbound?",
      answer: "No, your emails are sent from your personal Gmail account, giving you full control over the content. Inkbound offers guidance, but you own the communication. Coaches value genuine outreach, and Inkbound ensures your messages reflect your authentic voice."
    },
    {
      question: "How does Inkbound help me get noticed?",
      answer: "Inkbound uses AI to generate personalized emails tailored to the preferences of each school’s coaching staff. Additionally, our recommendation engine suggests schools that match your academic, athletic, and geographical preferences, increasing your chances of making meaningful connections."
    },
    {
      question: "Is there a trial available?",
      answer: "Yes, we offer a Basic plan that allows you to access and contact one school for free. This gives you the chance to try out our platform and understand how Inkbound can enhance your recruitment efforts before committing to a paid plan."
    },
    {
      question: "How secure is my personal data?",
      answer: "We take data security seriously and have passed Google's rigorous CASA Tier 2 Security Assessment. As a Google-approved website, your personal information is protected with industry-standard encryption. We don't read or access your emails—everything is securely transmitted directly between you and the coaches."
    },
    {
      question: "What if I don't know which schools to target?",
      answer: "Inkbound provides personalized school suggestions based on your athletic profile, academic standing, and preferences. Our AI engine can also help you identify schools that might not be on your radar but align well with your goals."
    },
    {
      question: "How does the AI help with my communication?",
      answer: "Our AI-driven assistant offers templates and suggestions tailored to each specific coach and school, ensuring your emails are both professional and relevant. It also helps you track your progress and follow up with coaches at the right time, so no opportunity slips through the cracks."
    },
    {
      question: "Can I customize the email templates?",
      answer: "Yes! While our templates are designed to help you craft the perfect message, you can edit them to match your tone and style. This allows you to maintain a personal touch while benefiting from the AI’s recommendations."
    },
    {
      question: "How often should I email coaches?",
      answer: "Coaches appreciate persistence but dislike being overwhelmed. We recommend an initial email, followed by a polite follow-up every few weeks if you haven't received a response. Inkbound will help you track your communication and suggest the best times to reach out again."
    },
    {
      question: "Do I need to pay to contact multiple schools?",
      answer: "While our Basic plan offers access to one school for free, you can unlock more schools with our affordable paid plans. These plans are designed to give you the flexibility to contact multiple schools based on your recruitment goals."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gradient-to-r from-blue-50 to-babyblue-200 w-full">
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
