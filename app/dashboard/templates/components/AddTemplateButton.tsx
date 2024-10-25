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
    const title = "New Template " + now.getTime().toString();
    try {
      await createBlankTemplate(title);
      setIsModalOpen(false);
      const encodedTitle = encodeURIComponent(title);
      router.push(`/dashboard/templates/${encodedTitle}`);
    } catch (error) {
      console.error('Error creating template:', error);
      // Handle error (e.g., show an error message to the user)
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
        content: "",
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
