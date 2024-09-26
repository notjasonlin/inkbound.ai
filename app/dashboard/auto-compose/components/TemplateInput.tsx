import React from 'react';

interface TemplateInputProps {
  template: string;
  onTemplateChange: (template: string) => void;
}

const TemplateInput: React.FC<TemplateInputProps> = ({ template, onTemplateChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Email Template</h2>
      <textarea
        value={template}
        onChange={(e) => onTemplateChange(e.target.value)}
        className="w-full h-40 p-2 border border-gray-300 rounded"
        placeholder="Enter your email template here..."
      />
    </div>
  );
};

export default TemplateInput;
