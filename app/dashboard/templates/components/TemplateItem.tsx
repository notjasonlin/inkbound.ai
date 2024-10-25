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
    <div className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between h-full">
      <div>
        <Link href={`/dashboard/templates/${encodeURIComponent(template.title)}`} className="block mb-2">
          <div className="aspect-w-16 aspect-h-9 mb-2">
            <TemplateDisplay template={template} />
          </div>
          <h3 className="text-lg font-medium text-blue-400 hover:text-blue-300 truncate">{template.title}</h3>
        </Link>
        <p className="text-sm text-gray-400">
          Last updated: {new Date(template.updated_at).toLocaleString()}
        </p>
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <button
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full"
        >
          {isDuplicating ? 'Duplicating...' : 'Duplicate'}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
