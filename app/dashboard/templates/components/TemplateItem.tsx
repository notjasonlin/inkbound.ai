"use client";
import Link from 'next/link';
import { useState } from 'react';
import TemplateDisplay from './TemplateDisplay';
import { TemplateData } from '@/types/template';

interface TemplateItemProps {
  template: TemplateData;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (template: TemplateData) => Promise<void>;
}

export default function TemplateItem({ template, onDelete, onDuplicate }: TemplateItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(template.id);
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDuplicating(true);
    try {
      await onDuplicate(template);
    } catch (error) {
      console.error('Error duplicating template:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-xl shadow-lg p-6 flex flex-col justify-between h-full transform transition-transform hover:scale-105 hover:shadow-2xl sm:max-w-full md:max-w-md lg:max-w-sm xl:max-w-xs mx-auto mb-6">
      <div>
        <Link href={`/dashboard/templates/${encodeURIComponent(template.title)}`} className="block mb-2">
          <div className="relative mb-4 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <TemplateDisplay template={template} />
          </div>
          <h3 className="text-xl font-semibold text-white hover:text-indigo-200 truncate transition-colors duration-200">
            {template.title}
          </h3>
        </Link>
        <p className="text-xs text-blue-300 mt-1 tracking-wider">
          Last updated: {new Date(template.updated_at).toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col space-y-3 mt-6">
        <button
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className={`flex items-center justify-center ${
            isDuplicating ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold py-3 rounded-full shadow-md transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-blue-400`}
        >
          {isDuplicating ? (
            <span className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Duplicating...</span>
            </span>
          ) : (
            'Duplicate'
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`flex items-center justify-center ${
            isDeleting ? 'bg-red-500' : 'bg-red-600 hover:bg-red-700'
          } text-white font-semibold py-3 rounded-full shadow-md transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
        >
          {isDeleting ? (
            <span className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Deleting...</span>
            </span>
          ) : (
            'Delete'
          )}
        </button>
      </div>
    </div>
  );
}
