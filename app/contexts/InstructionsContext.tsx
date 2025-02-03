'use client';

import { createContext, useContext, useState } from 'react';

interface InstructionsContextType {
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const InstructionsContext = createContext<InstructionsContextType | undefined>(undefined);

export function InstructionsProvider({ children }: { children: React.ReactNode }) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <InstructionsContext.Provider value={{ 
      showInstructions, 
      setShowInstructions,
      currentPage,
      setCurrentPage
    }}>
      {children}
    </InstructionsContext.Provider>
  );
}

export function useInstructions() {
  const context = useContext(InstructionsContext);
  if (context === undefined) {
    throw new Error('useInstructions must be used within an InstructionsProvider');
  }
  return context;
} 