'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import Modal from './Modal'; // Adjust the import path as needed

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function ComposeEmail() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append('to', data.to);
    formData.append('subject', data.subject);
    formData.append('content', content);
    attachments.forEach((file) => formData.append('attachments', file));

    try {
      const response = await fetch('/api/gmail', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        resetForm();
      } else {
        alert(`Failed to send email: ${result.error}\nDetails: ${result.details || 'No additional details'}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(`Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    reset();
    setContent('');
    setAttachments([]);
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="p-2 bg-blue-500 text-white rounded">
        Compose Email
      </button>
      <Modal isOpen={isModalOpen} onClose={resetForm}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('to')} placeholder="To" className="w-full p-2 border rounded" />
          <input {...register('subject')} placeholder="Subject" className="w-full p-2 border rounded" />
          <ReactQuill value={content} onChange={setContent} />
          <input
            type="file"
            multiple
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Send</button>
        </form>
      </Modal>
    </>
  );
}
