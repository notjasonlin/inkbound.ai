import React, { useState, useEffect } from 'react';
import { SchoolData } from '@/types/school/index';
import EmailSender from './EmailSender';
import { createClient } from "@/utils/supabase/client";
import { TemplateData } from '@/types/template';
import TemplateModal from './TemplateModal';

interface EmailComposerProps {
  schools: SchoolData[];
  allSchools: SchoolData[];
  onAddSchool: (school: SchoolData) => void;
  onRemoveSchool: (schoolId: string) => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ schools, onRemoveSchool }) => {
  const [activeSchoolIndex, setActiveSchoolIndex] = useState<number>(0);
  const [sentSchools, setSentSchools] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<TemplateData[]>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const grabTemplates = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error(error.message);
      }

      if (data) {
        const tempsToAdd: TemplateData[] = data.map((curr: any) => ({
          id: curr.id,
          content: curr.content,
          title: curr.title,
          updated_at: curr.updated_at
        }));
        setTemplates(tempsToAdd);
      }
    };

    grabTemplates();
  }, []);

  const closeSchoolTab = async (index: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const schoolToClose = schools[index];
    const { data, error } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_id', schoolToClose.id)
      .single();

    if (typeof onRemoveSchool === 'function') {
      if (error || !data || sentSchools.has(schoolToClose.id)) {
        onRemoveSchool(schoolToClose.id);
      } else {
        if (window.confirm('There are unsaved changes. Are you sure you want to close this tab?')) {
          onRemoveSchool(schoolToClose.id);
        }
      }
    }

    if (index === activeSchoolIndex) {
      setActiveSchoolIndex(Math.max(0, index - 1));
    } else if (index < activeSchoolIndex) {
      setActiveSchoolIndex(activeSchoolIndex - 1);
    }
  };

  const handleEmailSent = (schoolId: string) => {
    setSentSchools(prev => new Set(prev).add(schoolId));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Modal for Templates */}
      {templates && (
        <TemplateModal 
          templates={templates} 
          isOpen={isModalOpen} 
          setIsOpen={setIsModalOpen} 
          modalButtonsOnClick={setSelectedTemplate} 
        />
      )}

      {/* Responsive School Tabs */}
      <div className="flex flex-wrap border-b overflow-x-auto">
        {schools.map((school, index) => (
          <div
            key={school.id}
            className={`px-4 py-2 cursor-pointer whitespace-nowrap ${index === activeSchoolIndex ? 'bg-white border-t border-l border-r' : 'bg-gray-200'}`}
            onClick={() => setActiveSchoolIndex(index)}
          >
            {school.school}
            {sentSchools.has(school.id) && (
              <span className="ml-2 text-green-500">✓</span>
            )}
            <button
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                closeSchoolTab(index);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Email Sender Component */}
      {schools[activeSchoolIndex] && templates && (
        <EmailSender
          key={schools[activeSchoolIndex].id}
          school={schools[activeSchoolIndex]}
          onEmailSent={handleEmailSent}
          setIsOpen={setIsModalOpen}
          selectedTemplate={selectedTemplate}
        />
      )}
    </div>
  );
};

export default EmailComposer;
