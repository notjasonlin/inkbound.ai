import React, { useState, useEffect, useCallback } from 'react';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import { debounce } from 'lodash';
import { TemplateData } from '@/types/template';
import readTemplate from '@/functions/readTemplate';
import Alert from '@/components/ui/Alert';
import { incrementUsage } from '@/utils/checkUserLimits';

interface EmailSenderProps {
  school: SchoolData;
  onEmailSent: (schoolId: string) => void;
  setIsOpen: (state: boolean) => void;
  selectedTemplate: TemplateData | null;
}

interface EmailDraft {
  emailsTo: string;
  subject: string;
  template: string;
  customSection: string;
}

const EmailSender: React.FC<EmailSenderProps> = ({ school, onEmailSent, setIsOpen, selectedTemplate }) => {
  const supabase = createClient();
  const [emailDraft, setEmailDraft] = useState<EmailDraft>({
    emailsTo: school?.coaches?.map(coach => coach.email).join(', ') || '',
    subject: '',
    template: '',
    customSection: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [warning, setWarning] = useState<boolean>(false);

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

  useEffect(() => { 
    if (selectedTemplate) {
      handleInputChange();
    }
  }, [selectedTemplate]);

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

  const handleInputChange = (e?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e) {
      const { name, value } = e.target;
      const updatedDraft = { ...emailDraft, [name]: value };
      setEmailDraft(updatedDraft);
      debouncedSave(updatedDraft);
    } else if (selectedTemplate) {
      if (emailDraft.subject !== "" || emailDraft.customSection !== "") {
        setWarning(true);
      } else {
        writeWithTemplate();
      }
    }
  };

  const writeWithTemplate = () => {
    if (selectedTemplate) {
      const updatedDraft = {
        emailsTo: school?.coaches?.map(coach => coach.email).join(', ') || '',
        subject: selectedTemplate.content.title,
        template: selectedTemplate.title,
        customSection: readTemplate(selectedTemplate, school) || '', 
      };
      setEmailDraft(updatedDraft);
      debouncedSave(updatedDraft);
    }
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user && 'id' in user) {
        await incrementUsage(user.id, { schools_sent: 1 });
      } else {
        console.error('User is null or does not have an id property');
      }

      onEmailSent(school.id);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Compose Email for {school.school}</h2>

      <button
        onClick={() => setIsOpen(true)}
        className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-md"
      >
        Select Template
      </button>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Emails Send To:</label>
        <input
          type="text"
          name="emailsTo"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={emailDraft.emailsTo}
          onChange={handleInputChange}
          placeholder="email1@example.com, email2@example.com"
        />
      </div>

      {warning &&
        <Alert
          header={"Overwriting Draft"}
          message={"You currently have a draft saved. Overwrite with the template?"}
          type={"warning"}
          onClose={() => setWarning(false)}
          onConfirm={() => {
            writeWithTemplate();
            setWarning(false);
          }}
        />
      }

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Subject:</label>
        <input
          type="text"
          name="subject"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={emailDraft.subject}
          onChange={handleInputChange}
          placeholder="Email Subject"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Custom School Section:</label>
        <textarea
          name="customSection"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={emailDraft.customSection}
          onChange={handleInputChange}
          placeholder="Enter custom information here..."
          rows={4}
        ></textarea>
      </div>

      <button
        onClick={handleSend}
        className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg text-lg font-semibold"
      >
        Send Email
      </button>

      {saveStatus && <p className="mt-4 text-center text-gray-600">{saveStatus}</p>}
    </div>
  );
};

export default EmailSender;
