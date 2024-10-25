import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    title: 'Welcome',
    content: 'Welcome to Inkbound! Let\'s get you started on your college recruitment journey.',
    link: '/dashboard',
    linkText: 'Explore Dashboard'
  },
  {
    title: 'Find Your Dream College',
    content: 'Answer a few questions to get personalized college recommendations.',
    link: '/dashboard/profile/background',
    linkText: 'Fill out Profile'
  },
  {
    title: 'Favorite Your First School',
    content: 'Add schools to your favorites to keep track of your top choices.',
    link: '/dashboard/schools',
    linkText: 'View Schools'
  },
  {
    title: 'Create Your First Template',
    content: 'Use our AI-powered system to create personalized email templates.',
    link: '/dashboard/templates',
    linkText: 'Create Template'
  },
  {
    title: 'Send Your First Email',
    content: 'Reach out to coaches using our email composer.',
    link: '/dashboard/compose',
    linkText: 'Compose Email'
  }
];

const OnboardingModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-lg p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h2>
            <p className="mb-6">{steps[currentStep].content}</p>
            <Link href={steps[currentStep].link} className="text-blue-500 hover:underline mb-4 block">
              {steps[currentStep].linkText}
            </Link>
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
