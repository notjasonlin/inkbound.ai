"use client";
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";

interface Template {
  id: string;
  title: string;
  updated_at: string;
}

export default function TemplateItem({ template }: { template: Template }) {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
      <div>
        <Link href={`/dashboard/outline/templates/${template.id}`} className="text-xl font-semibold text-blue-500 hover:underline">
          {template.title}
        </Link>
        <p className="text-sm text-gray-500">Last updated: {new Date(template.updated_at).toLocaleDateString()}</p>
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
