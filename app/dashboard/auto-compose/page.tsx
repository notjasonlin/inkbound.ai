"use client";

import React, { useState, useEffect } from 'react';
import { SchoolData, CoachData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import EmailPreview from './components/EmailPreview';
import QueueStatus from './components/QueueStatus';
import TemplateModal from './components/TemplateModal';
import { TemplateData } from '@/types/template/index';
import Sidebar from './components/Sidebar';

interface EmailPreviewData {
  to: string;
  subject: string;
  content: string;
}

interface QueueStatusItem {
  schoolId: string;
  schoolName: string;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  timestamp: string;
}

export default function AutoComposePage() {
  const [favoriteSchools, setFavoriteSchools] = useState<SchoolData[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<SchoolData[]>([]);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatusItem[]>([]);
  const [previewEmails, setPreviewEmails] = useState<{ [key: string]: EmailPreviewData }>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchFavoriteSchools();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate && selectedSchools.length > 0) {
      generatePreviews();
    }
  }, [selectedTemplate, selectedSchools]);


  const beforeUnloadListener = (event) => {
    // setTimeout(() => alert('hi!'));
    event.preventDefault();

    // Modern browsers require setting the returnValue property of the event for confirmation dialogs
    event.returnValue = "Are you sure you want to exit?";
  };

  window.addEventListener("beforeunload", beforeUnloadListener);


  const fetchFavoriteSchools = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("favorite_schools")
      .select("data")
      .eq("uuid", user.id)
      .single();

    if (error) {
      console.error("Error fetching favorite schools:", error);
    } else if (data && data.data) {
      setFavoriteSchools(data.data);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Optionally, set an error state here to display to the user
    }
  };

  const handleSchoolSelection = (schools: SchoolData[]) => {
    setSelectedSchools(schools);
  };

  const handleTemplateSelection = (template: TemplateData) => {
    setSelectedTemplate(template);
    setShowTemplateModal(false);
  };

  const generatePreviews = () => {
    if (!selectedTemplate) return;

    const newPreviews: { [key: string]: EmailPreviewData } = {};
    selectedSchools.forEach(school => {
      let content = selectedTemplate.content.content || '';
      let subject = selectedTemplate.content.title || '';

      // Replace placeholders in content and subject
      [content, subject] = [content, subject].map(text =>
        text.replace(/\[schoolName\]/g, school.school)
          .replace(/\[coachNames\]/g, school.coaches.map(coach => coach.name).join(', '))
          .replace(/\[coachLastNames\]/g, school.coaches.map(coach => coach.name.split(' ').pop()).join(', '))
      );

      newPreviews[school.id] = {
        to: school.coaches.map(coach => coach.email).join(', '),
        subject,
        content
      };
    });
    setPreviewEmails(newPreviews);
  };

  const sendEmail = async (emailData: EmailPreviewData, schoolId: string, schoolName: string) => {
    try {
      setQueueStatus(prev => prev.map(item => 
        item.schoolId === schoolId ? { ...item, status: 'sending' } : item
      ));

      console.log('Fetching coach information...');
      const { data: coachinformation, error: coachinformationError } = await supabase
        .from('coachinformation')
        .select('*')
        .eq('school_id', schoolId);

      if (coachinformationError) {
        console.error('Failed to fetch coach information:', coachinformationError);
        throw new Error('Failed to fetch coach information');
      }

      console.log('Coach information fetched:', coachinformation);

      const coachEmails = coachinformation.reduce((acc, coach) => {
        if (coach.email) {
          acc[coach.name || 'Unknown'] = coach.email;
        }
        return acc;
      }, {});

      console.log('Storing coach emails...');
      const { error: storeError } = await supabase
        .from('school_coach_emails')
        .upsert({
          user_id: supabase.auth.getUser().then(({ data: { user } }) => user?.id),
          school_id: schoolId,
          coach_emails: coachEmails
        }, {
          onConflict: 'user_id,school_id'
        });

      if (storeError) {
        console.error('Failed to store coach emails:', storeError);
        throw new Error('Failed to store coach emails');
      }

      console.log('Coach emails stored successfully');

      console.log('Sending email...');
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...emailData,
          coachEmails,
          schoolName,
          schoolId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send email:', errorData);
        throw new Error(`Failed to send email: ${errorData.error}`);
      }

      console.log('Email sent successfully');

      setQueueStatus(prev => prev.map(item => 
        item.schoolId === schoolId 
          ? { ...item, status: 'sent', timestamp: new Date().toISOString() }
          : item
      ));
    } catch (error) {
      console.error('Error in sendEmail function:', error);
      setQueueStatus(prev => prev.map(item => 
        item.schoolId === schoolId 
          ? { ...item, status: 'failed', timestamp: new Date().toISOString() }
          : item
      ));
    }
  };

  const processQueue = async (queue: { emailData: EmailPreviewData, schoolId: string, schoolName: string }[]) => {
    const processNextBatch = async () => {
      if (queue.length === 0) {
        setIsSending(false);
        return;
      }

      const batch = queue.slice(0, 2);  // Process 2 emails at a time
      queue = queue.slice(2);

      await Promise.all(batch.map(item => sendEmail(item.emailData, item.schoolId, item.schoolName)));

      // Wait for 1 second before processing the next batch
      setTimeout(() => processNextBatch(), 1000);
    };

    await processNextBatch();
  };

  const handleSubmit = async () => {
    if (selectedSchools.length === 0 || !selectedTemplate) {
      alert("Please select schools and a template.");
      return;
    }

    setIsSending(true);

    const emailQueue = selectedSchools.map(school => ({
      emailData: previewEmails[school.id],
      schoolId: school.id,
      schoolName: school.school  // Assuming the school object has a 'school' property with the name
    }));

    setQueueStatus(emailQueue.map(item => ({
      schoolId: item.schoolId,
      schoolName: item.schoolName,
      status: 'queued',
      timestamp: new Date().toISOString()
    })));

    processQueue(emailQueue);
  };

  useEffect(() => {
    const statusElement = document.getElementById('queue-status');
    if (statusElement) {
      statusElement.scrollTop = statusElement.scrollHeight;
    }
  }, [queueStatus]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="md:w-1/4 w-full">
        <Sidebar onSelectSchools={handleSchoolSelection} />
      </div>

      <div className="flex-1 p-6 w-full md:w-3/4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Auto Compose</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Choose Template</h2>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Select Template
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold"
          disabled={selectedSchools.length === 0 || !selectedTemplate || isSending}
        >
          {isSending ? 'Sending...' : 'Send Emails'}
        </button>

        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          templates={templates}
          onSelectTemplate={handleTemplateSelection}
        />

        {selectedTemplate && selectedSchools.length > 0 && (
          <div className="mb-8">
            <EmailPreview
              schools={selectedSchools}
              previewEmails={previewEmails}
            />
          </div>
        )}

        <div className="flex flex-col items-start">
          <div className="mt-6">
            <QueueStatus status={queueStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}