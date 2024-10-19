"use client"; // This makes the component a client-side component

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "@/utils/supabase/client";

const AddTemplateButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();
  const now = new Date();

  const handleConfirm = async () => {
    const title = "New Template " + now.getTime().toString();
    await createBlankTemplate(title);
    setIsModalOpen(false);
    const encodedTitle = encodeURIComponent(title);
    window.location.href = `/dashboard/templates/${encodeURIComponent(encodedTitle)}`;
  };

  const createBlankTemplate = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    const template = {
      id: uuidv4(),
      user_id: user?.id,
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
      console.error('Error adding template:', error);
    }
  }

  return (
    <>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
        onClick={() => setIsModalOpen(true)}
      >
        <p>Add Template</p>
      </button>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AddTemplateButton;
