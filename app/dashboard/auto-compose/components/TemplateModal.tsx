import React from 'react';
import { TemplateData } from '@/types/template/index';
import { motion } from 'framer-motion';

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
      <motion.div
        className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-2xl relative z-50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Select a Template</h2>
        {templates.length === 0 ? (
          <p className="text-gray-700">You haven't created any templates yet.</p>
        ) : (
          <ul className="space-y-2">
            {templates.map((template) => (
              <li 
                key={template.id} 
                className="cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-colors"
                onClick={() => onSelectTemplate(template)}
              >
                <span className="text-lg text-blue-700 font-medium">{template.title}</span>
              </li>
            ))}
          </ul>
        )}
        <button 
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default TemplateModal;
