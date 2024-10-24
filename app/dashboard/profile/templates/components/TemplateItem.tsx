"use client";
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import TemplateDisplay from './TemplateDisplay';
import { TemplateData } from '@/types/template';

export default function TemplateItem({ template }: { template: TemplateData }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', template.id);

    if (error) {
      console.error('Error deleting template:', error);
      // Handle error appropriately
    } else {
      // Refresh the template list or remove this item from the list
    }
    setIsDeleting(false);
  };

  return (
    <>
      {template && <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md p-6 mb-4 flex flex-col justify-between items-center">
        <div className="w-full">
          {/* <Link href={`/dashboard/templates/${encodeURIComponent(template.title)}`} className="text-xl font-semibold text-blue-600 hover:no-underline">*/}
          <Link href={`/dashboard/profile/templates/${encodeURIComponent(template.title)}`} className="text-xl font-semibold text-blue-600 hover:no-underline">

            <div className="mb-2"> {/* Add margin bottom for spacing */}
              <TemplateDisplay template={template} />
            </div>
            <div className="text-lg font-medium">{template.title}</div> {/* Increase font size */}
          </Link>
          <p className="text-sm text-gray-600">Last updated: {new Date(template.updated_at).toLocaleDateString()}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-4 transition duration-200"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>}
    </>
  );
}
