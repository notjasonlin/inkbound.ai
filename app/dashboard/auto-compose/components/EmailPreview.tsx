import React, { useState } from 'react';
import { SchoolData } from '@/types/school/index';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import styles from '@/styles/EmailPreview.module.css';
import { cn } from '@/lib/utils';

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
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentIndex < schools.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
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
    <div className={styles.container}>
      <h2 className={styles.title}>Email Previews</h2>
      
      <div className={styles.carouselContainer}>
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={schools[currentIndex].id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className={styles.emailCard}
          >
            <h3 className={styles.schoolTitle}>{schools[currentIndex].school}</h3>

            <div className={styles.emailContent}>
              <p><strong>To:</strong> {previewEmails[schools[currentIndex].id]?.to}</p>
              <p><strong>Subject:</strong> {previewEmails[schools[currentIndex].id]?.subject}</p>
              <div
                className={styles.contentText}
                style={{ whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={{ __html: previewEmails[schools[currentIndex].id]?.content || '' }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.navigationContainer}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={cn(
            styles.navigationButton,
            currentIndex === 0 ? styles.navigationButtonDisabled : styles.navigationButtonEnabled
          )}
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === schools.length - 1}
          className={cn(
            styles.navigationButton,
            currentIndex === schools.length - 1 ? styles.navigationButtonDisabled : styles.navigationButtonEnabled
          )}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default EmailPreview;