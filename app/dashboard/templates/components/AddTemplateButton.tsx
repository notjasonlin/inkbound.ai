"use client"; // This makes the component a client-side component

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';

const AddTemplateButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const now = new Date();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const { data: existingTemplates, error } = await supabase
        .from('templates')
        .select('title')
        .ilike('title', 'New Template%')
        .order('title', { ascending: true });

      if (error) throw error;

      let nextNumber = 1;
      const baseTitle = "New Template";
      let title = baseTitle;

      if (existingTemplates && existingTemplates.length > 0) {
        const usedNumbers = existingTemplates
          .map(template => {
            const match = template.title.match(/New Template( \((\d+)\))?/);
            return match ? (match[2] ? parseInt(match[2]) : 1) : 0;
          })
          .filter(num => num > 0);

        if (usedNumbers.length > 0) {
          // If "New Template" exists, start with (2)
          // If "New Template (2)" exists, look for next number, etc.
          nextNumber = Math.max(...usedNumbers) + 1;
          title = `${baseTitle} (${nextNumber})`;
        }
      }

      await createBlankTemplate(title);
      setIsModalOpen(false);
      const encodedTitle = encodeURIComponent(title);
      router.push(`/dashboard/templates/${encodedTitle}`);
    } catch (error) {
      console.error('Error creating data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBlankTemplate = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const template = {
      id: uuidv4(),
      user_id: user.id,
      title: title,
      content: {
        title: "",
        content: "Hello [coachLastName],\n\n\n\nSincerely,\n[studentFullName]",
      }
    }

    const { error } = await supabase
      .from('templates')
      .insert(template);

    if (error) {
      throw error;
    }
  }

  return (
    <>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
      >
        <p>{isLoading ? 'Creating...' : 'Add Template'}</p>
      </button>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
        isLoading={isLoading}
      />
    </>
  );
};

export default AddTemplateButton;
