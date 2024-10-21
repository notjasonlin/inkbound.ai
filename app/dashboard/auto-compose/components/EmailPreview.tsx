import React, { useState } from 'react';
import { SchoolData } from '@/types/school/index';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface EmailPreviewData {
  to: string;
  subject: string;
  content: string;
}

interface EmailPreviewProps {
  schools: SchoolData[];
  previewEmails: { [key: string]: EmailPreviewData };
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ schools, previewEmails }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // Track the direction of slide

  const handleNext = () => {
    if (currentIndex < schools.length - 1) {
      setDirection(1); // Moving forward
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1); // Moving backward
      setCurrentIndex(currentIndex - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="mb-6 relative max-w-screen-xl mx-auto p-2 sm:p-6 lg:p-8"> {/* Responsive padding and width */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-center">Email Previews</h2>
      
      {/* Email Preview Cards Carousel */}
      <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden"> {/* Keep full card height */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={schools[currentIndex].id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="absolute top-0 left-0 w-full p-4 bg-white rounded-lg shadow-md h-full"
          >
            <h3 className="text-lg font-semibold mb-2">{schools[currentIndex].school}</h3>

            {/* Scrollable Email Content */}
            <div className="border border-gray-300 rounded p-3 bg-gray-50 text-sm sm:text-base whitespace-pre-line h-full overflow-y-auto"> {/* Allow vertical scrolling */}
              <p><strong>To:</strong> {previewEmails[schools[currentIndex].id]?.to}</p>
              <p><strong>Subject:</strong> {previewEmails[schools[currentIndex].id]?.subject}</p>
              <div
                className="mt-2"
                style={{ whiteSpace: 'pre-line' }} // Preserve line breaks
                dangerouslySetInnerHTML={{ __html: previewEmails[schools[currentIndex].id]?.content || '' }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-4 max-w-xl mx-auto">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`p-3 sm:p-4 lg:p-5 rounded-full bg-blue-500 text-white ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === schools.length - 1}
          className={`p-3 sm:p-4 lg:p-5 rounded-full bg-blue-500 text-white ${currentIndex === schools.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default EmailPreview;
