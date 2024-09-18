import React, { useState, useEffect } from 'react';
import { SchoolData } from '@/types/school/index';
import EmailSender from './EmailSender';
import { createClient } from "@/utils/supabase/client";

interface EmailComposerProps {
  schools: SchoolData[];
  allSchools: SchoolData[];
  onAddSchool: (school: SchoolData) => void;
  onRemoveSchool: (schoolId: string) => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ schools, onRemoveSchool }) => {
  console.log('onRemoveSchool:', onRemoveSchool);
  const [activeSchoolIndex, setActiveSchoolIndex] = useState<number>(0);
  const [sentSchools, setSentSchools] = useState<Set<string>>(new Set());
  const supabase = createClient();

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
    } else {
      console.error('onRemoveSchool is not a function');
      // Optionally, you can handle this case, e.g., by updating local state
    }

    if (index === activeSchoolIndex) {
      setActiveSchoolIndex(Math.max(0, index - 1));
    } else if (index < activeSchoolIndex) {
      setActiveSchoolIndex(activeSchoolIndex - 1);
    }
  };

  const handleEmailSent = (schoolId: string) => {
    setSentSchools(prev => new Set(prev).add(schoolId));
    // Optionally close the tab automatically
    // closeSchoolTab(schools.findIndex(school => school.id === schoolId));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex border-b">
        {schools.map((school, index) => (
          <div
            key={school.id}
            className={`px-4 py-2 cursor-pointer ${index === activeSchoolIndex ? 'bg-white border-t border-l border-r' : 'bg-gray-200'}`}
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
      {schools[activeSchoolIndex] && (
        <EmailSender 
          key={schools[activeSchoolIndex].id} 
          school={schools[activeSchoolIndex]} 
          onEmailSent={handleEmailSent}
        />
      )}
    </div>
  );
};

export default EmailComposer;
