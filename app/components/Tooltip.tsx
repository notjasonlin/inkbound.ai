'use client';

import { ReactNode, useState } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 px-4 py-2 text-sm text-white bg-black/75 backdrop-blur-sm rounded-lg top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
          {text}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-black/75" />
        </div>
      )}
    </div>
  );
} 