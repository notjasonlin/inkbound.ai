import React from 'react';
import { TemplateData } from '@/types/template/index';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: TemplateData[];
  onSelectTemplate: (template: TemplateData) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, templates, onSelectTemplate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-lg relative z-50">
        <h2 className="text-2xl font-bold mb-4">Select a Template</h2>
        {templates.length === 0 ? (
          <p>You haven't created any templates yet.</p>
        ) : (
          <ul>
            {templates.map((template) => (
              <li 
                key={template.id} 
                className="cursor-pointer hover:bg-gray-100 p-2"
                onClick={() => onSelectTemplate(template)}
              >
                {template.title}
              </li>
            ))}
          </ul>
        )}
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TemplateModal;
