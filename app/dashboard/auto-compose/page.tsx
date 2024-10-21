"use client";

import React, { useState, useEffect } from 'react';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import EmailPreview from './components/EmailPreview';
import QueueStatus from './components/QueueStatus';
import TemplateModal from './components/TemplateModal';
import Sidebar from './components/Sidebar';
import { TemplateData } from '@/types/template/index';
import { motion } from 'framer-motion';
import { checkUserLimits, incrementUsage } from '@/utils/checkUserLimits';
import { User } from '@supabase/supabase-js';
import readTemplate from "@/functions/readTemplate";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchFavoriteSchools();
    fetchTemplates();
    fetchUser();
  }, []);

  useEffect(() => {
    if (selectedTemplate && selectedSchools.length > 0) {
      generatePreviews();
    }
  }, [selectedTemplate, selectedSchools]);

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
    }
  };

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
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
      const content = readTemplate(selectedTemplate, school);
      const subject = selectedTemplate.content.title.replace(/\[schoolName\]/g, school.school);

      newPreviews[school.id] = {
        to: school.coaches.map(coach => coach.email).join(', '),
        subject,
        content: content || ''
      };
    });
    setPreviewEmails(newPreviews);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || selectedSchools.length === 0 || !user) return;

    const canSendEmails = await checkUserLimits((user as any)?.id, 'school');
    const canUseTemplate = await checkUserLimits((user as any)?.id, 'template');
    const canUseAI = await checkUserLimits((user as any)?.id, 'aiCall');

    if (!canSendEmails) {
      alert('You have reached your school limit. Please upgrade your plan to send more emails.');
      return;
    }

    if (!canUseTemplate) {
      alert('You have reached your template usage limit. Please upgrade your plan to use more templates.');
      return;
    }

    if (!canUseAI) {
      alert('You have reached your AI usage limit. Please upgrade your plan to use more AI features.');
      return;
    }

    setIsSending(true);

    const emailQueue = selectedSchools.map(school => ({
      emailData: previewEmails[school.id],
      schoolId: school.id,
      schoolName: school.school
    }));

    setQueueStatus(emailQueue.map(item => ({
      schoolId: item.schoolId,
      schoolName: item.schoolName,
      status: 'queued',
      timestamp: new Date().toISOString()
    })));

    processQueue(emailQueue);
  };

  const processQueue = async (queue: { emailData: EmailPreviewData, schoolId: string, schoolName: string }[]) => {
    const processNextBatch = async () => {
      if (queue.length === 0) {
        setIsSending(false);
        return;
      }

      const batch = queue.slice(0, 2);
      queue = queue.slice(2);

      await Promise.all(batch.map(item => sendEmail(item.emailData, item.schoolId, item.schoolName)));

      setTimeout(() => processNextBatch(), 1000);
    };

    await processNextBatch();
  };

  const sendEmail = async (emailData: EmailPreviewData, schoolId: string, schoolName: string) => {
    try {
      console.log(`Starting email process for ${schoolName} (ID: ${schoolId})`);
      setQueueStatus(prev => prev.map(item => 
        item.schoolId === schoolId ? { ...item, status: 'sending' } : item
      ));

      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) throw new Error('Failed to send email');

      setQueueStatus(prev => prev.map(item => 
        item.schoolId === schoolId 
          ? { ...item, status: 'sent', timestamp: new Date().toISOString() }
          : item
      ));

      if (user && 'id' in user) {
        await incrementUsage(user.id, 'school');
      } else {
        console.error('User is null or does not have an id property');
      }
    } catch (error) {
      console.error(error);
      setQueueStatus(prev => prev.map(item => 
        item.schoolId === schoolId 
          ? { ...item, status: 'failed', timestamp: new Date().toISOString() }
          : item
      ));
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Sidebar */}
      <Sidebar onSelectSchools={handleSchoolSelection} />

      {/* Main Content Area */}
      <motion.div
        className="flex-1 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-50 to-babyblue-200 p-8 shadow-xl rounded-2xl">
          <h1 className="text-3xl font-bold mb-6 text-blue-800">Auto Compose</h1>

          <div className="mb-6">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-blue-400 text-black rounded-full hover:bg-blue-700 transition-colors shadow-md"
            >
              Select Template
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-400 text-black rounded-full hover:bg-blue-700 transition-colors text-lg font-semibold shadow-md mb-4"
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
            <div className="mt-6">
              <EmailPreview
                schools={selectedSchools}
                previewEmails={previewEmails}
              />
            </div>
          )}

          <div className="mt-6">
            <QueueStatus status={queueStatus} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
