'use client';

import { useInstructions } from "@/app/contexts/InstructionsContext";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import DashboardInstructions from "./instructions/DashboardInstructions";
import SchoolsInstructions from "./instructions/SchoolsInstructions";
import ProfileInstructions from "./instructions/ProfileInstructions";
import TemplatesInstructions from "./instructions/TemplatesInstructions";
import ComposeInstructions from "./instructions/ComposeInstructions";
import InboxInstructions from "./instructions/InboxInstructions";

export default function InstructionsModal() {
  const { showInstructions, setShowInstructions } = useInstructions();
  const pathname = usePathname();

  const getInstructionsContent = () => {
    if (pathname === '/dashboard') return <DashboardInstructions />;
    if (pathname === '/dashboard/schools') return <SchoolsInstructions />;
    if (pathname?.startsWith('/dashboard/profile')) return <ProfileInstructions />;
    if (pathname?.startsWith('/dashboard/templates')) return <TemplatesInstructions />;
    if (pathname === '/dashboard/auto-compose') return <ComposeInstructions />;
    if (pathname === '/dashboard/compose') return <ComposeInstructions />;
    if (pathname === '/dashboard/inbox') return <InboxInstructions />;
    return <DashboardInstructions />;
  };

  return (
    <AnimatePresence>
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowInstructions(false)}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-lg p-8 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            {getInstructionsContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 