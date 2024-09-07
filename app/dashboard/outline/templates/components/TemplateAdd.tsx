"use client";
import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";

export default function TemplateAdd({ userId }: { userId: string }) {
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('templates')
      .insert({ user_id: userId, title, content: {} });

    if (error) {
      console.error('Error adding template:', error);
      // Handle error appropriately
    } else {
      setTitle('');
      // Refresh the template list or add this item to the list
    }
    setIsAdding(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New template title"
        className="border p-2 mr-2"
        required
      />
      <button
        type="submit"
        disabled={isAdding}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isAdding ? 'Adding...' : 'Add Template'}
      </button>
    </form>
  );
}
