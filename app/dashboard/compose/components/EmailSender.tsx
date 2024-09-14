import React, { useState, useEffect, useCallback } from 'react';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import { debounce } from 'lodash';

interface EmailSenderProps {
  school: SchoolData;
  onEmailSent: (schoolId: string) => void;
}

interface EmailDraft {
  emailsTo: string;
  subject: string;
  template: string;
  customSection: string;
}

const EmailSender: React.FC<EmailSenderProps> = ({ school, onEmailSent }) => {
  const supabase = createClient();
  const [emailDraft, setEmailDraft] = useState<EmailDraft>({
    emailsTo: school.coaches.map(coach => coach.email).join(', '),
    subject: '',
    template: '',
    customSection: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchDraft = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('school_id', school.id)
        .single();

      if (error) {
        console.error('Error fetching draft:', error);
        setEmailDraft({
          emailsTo: school.coaches.map(coach => coach.email).join(', '),
          subject: '',
          template: '',
          customSection: '',
        });
      } else if (data) {
        setEmailDraft(data.draft);
      }
    };

    fetchDraft();
  }, [school.id, supabase]);

  const saveDraft = useCallback(async (draft: EmailDraft) => {
    setIsSaving(true);
    setSaveStatus('Saving...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaveStatus('Error: User not logged in');
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from('email_drafts')
      .upsert({
        user_id: user.id,
        school_id: school.id,
        draft: draft,
      }, {
        onConflict: 'user_id,school_id'
      });

    if (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('Error saving draft');
    } else {
      setSaveStatus('Draft saved successfully');
    }

    setIsSaving(false);
  }, [school.id, supabase]);

  const debouncedSave = useCallback(debounce(saveDraft, 1000), [saveDraft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedDraft = { ...emailDraft, [name]: value };
    setEmailDraft(updatedDraft);
    debouncedSave(updatedDraft);
  };

  const handleSend = async () => {
    try {
      const response = await fetch('/api/sendToSpecificSchool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailDraft.emailsTo,
          subject: emailDraft.subject,
          content: emailDraft.template + emailDraft.customSection,
          schoolId: school.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      onEmailSent(school.id);
      // Optionally, update UI to show success message
    } catch (error) {
      console.error('Error sending email:', error);
      // Optionally, update UI to show error message
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Compose Email for {school.name}</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Emails Send To:</label>
        <input
          type="text"
          name="emailsTo"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          value={emailDraft.emailsTo}
          onChange={handleInputChange}
          placeholder="email1@example.com, email2@example.com"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Subject:</label>
        <input
          type="text"
          name="subject"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          value={emailDraft.subject}
          onChange={handleInputChange}
          placeholder="Email Subject"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Generic Email Template:</label>
        <textarea
          name="template"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          value={emailDraft.template}
          onChange={handleInputChange}
          placeholder="Enter your email template here..."
          rows={4}
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Custom School Section:</label>
        <textarea
          name="customSection"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          value={emailDraft.customSection}
          onChange={handleInputChange}
          placeholder="Enter custom information here..."
          rows={3}
        ></textarea>
      </div>

      <button
        onClick={handleSend}
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Send Email
      </button>

      {saveStatus && <p className="mt-2 text-sm text-gray-600">{saveStatus}</p>}
    </div>
  );
};

export default EmailSender;