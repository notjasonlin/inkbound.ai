"use client";
import { useState, useEffect, useCallback } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { debounce } from 'lodash';

interface Template {
  id: string;
  title: string;
  content: {
    title: string;
    content: string;
  };
}

export default function TemplateEditor({ template, userId }: { template: Template; userId: string }) {
  const [title, setTitle] = useState(template.title);
  const [itemTitle, setItemTitle] = useState(template.content?.title || '');
  const [itemContent, setItemContent] = useState(template.content?.content || '');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const saveTemplate = useCallback(async (newTitle: string, newItemTitle: string, newItemContent: string) => {
    setError(null);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('templates')
        .update({ 
          title: newTitle, 
          content: { 
            title: newItemTitle, 
            content: newItemContent 
          } 
        })
        .eq('id', template.id)
        .eq('user_id', userId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template. Please try again.');
    }
  }, [template.id, userId, router]);

  const debouncedSave = useCallback(debounce(saveTemplate, 1000), [saveTemplate]);

  useEffect(() => {
    debouncedSave(title, itemTitle, itemContent);
  }, [title, itemTitle, itemContent, debouncedSave]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Link href="/dashboard/profile/templates" className="text-blue-500 hover:text-blue-700">
          ← Back to Templates
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-2xl font-bold mb-4 p-2 w-full"
        placeholder="Template Title"
      />
      <div className="space-y-2 border p-4 rounded">
        <input
          type="text"
          value={itemTitle}
          onChange={(e) => setItemTitle(e.target.value)}
          placeholder="Item Title"
          className="block w-full text-xl font-semibold mb-2 p-2"
        />
        <textarea
          value={itemContent}
          onChange={(e) => setItemContent(e.target.value)}
          placeholder="Item Content"
          className="block w-full p-2 h-64 border rounded"
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
