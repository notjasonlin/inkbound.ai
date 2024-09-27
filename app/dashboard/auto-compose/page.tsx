"use client";

import React, { useState, useEffect } from 'react';
import { SchoolData, CoachData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import EmailPreview from './components/EmailPreview';
import QueueStatus from './components/QueueStatus';
import TemplateModal from './components/TemplateModal'; 
import { Template, TemplateContent } from '@/types/template/index';
import Sidebar from './components/Sidebar';

interface EmailPreviewData {
  to: string;
  subject: string;
  content: string;
}

export default function AutoComposePage() {
  const [favoriteSchools, setFavoriteSchools] = useState<SchoolData[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<SchoolData[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [queueStatus, setQueueStatus] = useState<string[]>([]);
  const [previewEmails, setPreviewEmails] = useState<{ [key: string]: EmailPreviewData }>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
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
      const { data, error } = await supabase
        .from('templates')
        .select('*');

      if (error) {
        throw error;
      }

      console.log('Fetched templates:', data);
      const validTemplates = data.filter((template: any) => 
        template && template.content && typeof template.content === 'object'
      );
      console.log('Valid templates:', validTemplates);
      setTemplates(validTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSchoolSelection = (schools: SchoolData[]) => {
    setSelectedSchools(schools);
  };

  const handleTemplateSelection = (template: Template) => {
    setSelectedTemplate(template);
  };

  const generatePreviews = () => {
    if (!selectedTemplate) return;

    const newPreviews: { [key: string]: EmailPreviewData } = {};
    selectedSchools.forEach(school => {
      const templateContent = selectedTemplate.content as unknown as TemplateContent;
      let content = templateContent.content || '';
      let subject = templateContent.title || '';

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

  const handleSubmit = async () => {
    if (selectedSchools.length === 0 || !selectedTemplate) {
      alert("Please select schools and a template.");
      return;
    }

    for (const school of selectedSchools) {
      try {
        const emailData = previewEmails[school.id];
        const response = await fetch('/api/queueEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            schoolId: school.id,
            to: emailData.to,
            subject: emailData.subject,
            content: emailData.content,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to queue email');
        }

        setQueueStatus(prev => [...prev, `Email queued for ${school.school}`]);
      } catch (error) {
        console.error('Error queueing email:', error);
        setQueueStatus(prev => [...prev, `Failed to queue email for ${school.school}`]);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onSelectSchools={handleSchoolSelection} />
      <div className="flex-1 overflow-auto p-6">
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
        
        <TemplateModal 
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          templates={templates}
          onSelectTemplate={handleTemplateSelection}
        />
        
        {selectedTemplate && selectedSchools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Email Preview</h2>
            <EmailPreview 
              schools={selectedSchools}
              previewEmails={previewEmails}
            />
          </div>
        )}
        
        <div className="flex flex-col items-start">
          <button 
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold"
            disabled={selectedSchools.length === 0 || !selectedTemplate}
          >
            Queue Emails
          </button>
          
          <div className="mt-6">
            <QueueStatus status={queueStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
