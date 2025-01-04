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
    <div className="bg-white rounded-lg border border-black shadow-sm p-4 flex flex-col justify-between h-full transform transition-transform hover:scale-105 hover:shadow-md">
      <div>
        <Link href={`/dashboard/templates/${encodeURIComponent(template.title)}`} className="block">
          <div className="relative mb-3 border border-black rounded overflow-hidden shadow-sm">
            <TemplateDisplay template={template} />
          </div>
          <h3 className="text-sm font-bold text-gray-800 truncate mb-1 hover:text-gray-600 transition-colors">
            {template.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-600 font-medium">
          Last updated: {new Date(template.updated_at).toLocaleString()}
        </p>
      </div>
      
      <div className="flex flex-col space-y-2 mt-3">
        <button
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className={`text-sm font-bold py-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition-colors ${
            isDuplicating
              ? 'bg-indigo-400 text-white cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          {isDuplicating ? 'Duplicating...' : 'Duplicate'}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`text-sm font-bold py-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 transition-colors ${
            isDeleting
              ? 'bg-red-400 text-white cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
