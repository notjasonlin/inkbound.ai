import React from 'react';
import { SchoolData } from '@/types/school/index';

interface EmailPreviewData {
  to: string;
  subject: string;
  content: string;
}

interface EmailPreviewProps {
  schools: SchoolData[];
  previewEmails: { [key: string]: EmailPreviewData };
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ schools, previewEmails }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Email Previews</h2>
      {schools.map(school => (
        <div key={school.id} className="mb-4">
          <h3 className="text-lg font-semibold">{school.school}</h3>
          <div className="border border-gray-300 rounded p-4 mt-2 bg-white">
            <p><strong>To:</strong> {previewEmails[school.id]?.to}</p>
            <p><strong>Subject:</strong> {previewEmails[school.id]?.subject}</p>
            <div dangerouslySetInnerHTML={{ __html: previewEmails[school.id]?.content || '' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailPreview;
