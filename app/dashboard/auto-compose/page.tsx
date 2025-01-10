"use client";

import React, { useState, useEffect } from 'react';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import EmailPreview from './components/EmailPreview';
import QueueStatus from './components/QueueStatus';
import TemplateModal from './components/TemplateModal';
import Sidebar from './components/Sidebar';
import { TemplateData } from '@/types/template/index';
import { checkUserLimits, incrementUsage } from '@/utils/checkUserLimits';
import { User } from '@supabase/supabase-js';
import readTemplate from "@/functions/readTemplate";
import styles from './styles/AutoCompose.module.css';
import { FavoriteSchoolsData } from '@/types/favorite_schools';
import { PersonalizedMessage } from '@/types/personalized_messages';
import PersonalizedMessageModal from './components/PersonalizedMessageModal';

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
  const [favoriteSchools, setFavoriteSchools] = useState<FavoriteSchoolsData | null>();
  const [personalizedMessages, setPersonalizedMessages] = useState<{ [key: string]: PersonalizedMessage }>({});
  const [selectedSchools, setSelectedSchools] = useState<SchoolData[]>([]);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatusItem[]>([]);
  const [previewEmails, setPreviewEmails] = useState<{ [key: string]: EmailPreviewData }>({});
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [toPersonalize, setToPersonalize] = useState<boolean>(false) // State for prompting user to write personalized message for super fav school
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchUser();
  }, []);

  useEffect(() => {
    if (selectedTemplate && selectedSchools.length > 0) {
      generatePreviews();
    }
  }, [selectedTemplate, selectedSchools]);

  useEffect(() => {
    if (selectedTemplate) {
      selectedTemplate.content.personalizedMessage ? setToPersonalize(true) : setToPersonalize(false);
    }
  }, [selectedTemplate])

  const fetchPersonalizedMessages = async () => {
    if (!user) return;

    try {
        const { data, error } = await supabase
            .from('personalized_messages')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_curr_fav', true);

        if (error) {
            console.error('Error fetching data:', error);
            return;
        }

        // Convert array to object with school_id as key
        const messagesObj: { [key: string]: PersonalizedMessage } = {};
        data?.forEach(msg => {
            if (msg.school_id) {
                messagesObj[msg.school_id] = {
                    id: msg.id,
                    user_id: msg.user_id,
                    school_id: msg.school_id,
                    school_name: msg.school_name,
                    message: msg.message,
                    is_super_fav: msg.is_super_fav,
                    is_curr_fav: msg.is_curr_fav,
                    is_generated: msg.is_generated,
                    needs_handwritten: msg.needs_handwritten
                };
            }
        });

        setPersonalizedMessages(messagesObj);
    } catch (err) {
        console.error('Error processing data:', err);
    }
  };

  useEffect(() => {
    fetchPersonalizedMessages();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
        const content = readTemplate(selectedTemplate, school, personalizedMessages);
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
    try {
      // First, insert all emails into the queue table for backup
      const queueInserts = queue.map(item => ({
        user_id: user?.id,
        school_id: item.schoolId,
        school_name: item.schoolName,
        email_data: item.emailData,
        status: 'queued'
      }));

      if (queueInserts.length > 0) {
        supabase
          .from('email_queue')
          .insert(queueInserts)
          .then(() => console.log('Data backed up'))
      }

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
    } catch (error) {
      console.error('Error processing:', error);
      setIsSending(false);
    }
  };

  const sendEmail = async (emailData: EmailPreviewData, schoolId: string, schoolName: string) => {
    try {
      setQueueStatus(prev => prev.map(item =>
        item.schoolId === schoolId ? { ...item, status: 'sending' } : item
      ));

      await supabase
        .from('email_queue')
        .update({ 
          status: 'sending',
          attempts: supabase.rpc('increment_attempts', { row_id: schoolId }),
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('user_id', user?.id);

      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emailData, schoolId, schoolName }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      // Update UI status
      setQueueStatus(prev => prev.map(item =>
        item.schoolId === schoolId
          ? { ...item, status: 'sent', timestamp: new Date().toISOString() }
          : item
      ));

      // Update database status
      await supabase
        .from('email_queue')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('user_id', user?.id);

      if (user && 'id' in user) {
        await incrementUsage(user.id, { schools_sent: 1 });
      }
    } catch (error) {
      console.error(error);
      
      // Update UI status
      setQueueStatus(prev => prev.map(item =>
        item.schoolId === schoolId
          ? { ...item, status: 'failed', timestamp: new Date().toISOString() }
          : item
      ));

      // Update database status
      await supabase
        .from('email_queue')
        .update({ 
          status: 'failed',
          error_message: (error as Error).message,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('user_id', user?.id);
    }
  };

  // Add this useEffect to check for and resume any interrupted queues
  useEffect(() => {
    const checkInterruptedQueue = async () => {
      if (!user) return;

      const { data: interruptedEmails, error } = await supabase
        .from('email_queue')
        .select()
        .eq('user_id', user.id)
        .in('status', ['queued', 'sending'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error:', error);
        return;
      }

      if (interruptedEmails?.length) {
        const shouldResume = window.confirm(
          `Found ${interruptedEmails.length} unsent emails from a previous session. Would you like to resume sending?`
        );

        if (shouldResume) {
          const queueToResume = interruptedEmails.map(item => ({
            emailData: item.email_data as EmailPreviewData,
            schoolId: item.school_id,
            schoolName: item.school_name
          }));

          setQueueStatus(interruptedEmails.map(item => ({
            schoolId: item.school_id,
            schoolName: item.school_name,
            status: 'queued',
            timestamp: item.created_at
          })));

          setIsSending(true);
          processQueue(queueToResume);
        }
      }
    };

    checkInterruptedQueue();
  }, [user]);

  useEffect(() => {
    let isLeaving = false;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSending && !isLeaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isSending && !isLeaving) {
        const shouldLeave = window.confirm(
          "Emails are still being sent. Are you sure you want to leave? Your progress is saved and you can resume sending later."
        );
        isLeaving = shouldLeave;
        
        if (!shouldLeave) {
          window.focus();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSending]);

  return (
    <div className={styles.container}>
      <Sidebar onSelectSchools={handleSchoolSelection} setFavoriteSchools={setFavoriteSchools} />

      {isModalOpen && user && <PersonalizedMessageModal
        userId={user.id}
        pMessages={personalizedMessages}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate?.content.content || ''}
        onMessagesUpdated={fetchPersonalizedMessages}
        selectedSchools={selectedSchools}
      />}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-50 to-babyblue-200 p-8 shadow-xl rounded-2xl">
          <h1 className={styles.title}>Auto Compose</h1>
          <div className={styles.linkWrapper}>
            <a href="/dashboard/compose" className={styles.link}>
              Want to send customized emails to individual schools instead? Go to Manual Compose →
            </a>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowTemplateModal(true)}
              className={styles.templateButton}
            >
              Select Template
            </button>

            <button
              onClick={() => {
                if (selectedSchools.length === 0) {
                  alert('Please select schools first');
                  return;
                }
                setIsModalOpen(true);
              }}
              className={styles.templateButton}
              disabled={selectedSchools.length === 0}
            >
              Personalize Message
            </button>
          </div>


          <button
            onClick={handleSubmit}
            className={styles.sendButton}
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
            <div className={styles.previewSection}>
              <EmailPreview
                schools={selectedSchools}
                previewEmails={previewEmails}
              />
            </div>
          )}

          <div className={styles.previewSection}>
            <QueueStatus status={queueStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}

