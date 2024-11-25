import { useState } from 'react';
import Link from 'next/link';

export default function ResourcesDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const resources = [
    { name: 'Blog', href: '/resources/blogs' },
    // Add more resources here as needed
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 hover:text-blue-600"
      >
        Resources
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-48 py-2 mt-2 bg-white rounded-md shadow-xl">
          {resources.map((resource) => (
            <Link
              key={resource.name}
              href={resource.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {resource.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 