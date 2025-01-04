import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number | string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: 'text' | 'number' | 'dropdown';
  options?: string[]; // For dropdown options, if type is 'dropdown'
}

export const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', options }) => (
  <div className="flex flex-col mb-4">
    <label className="mb-1 font-semibold text-gray-700">{label}</label>
    
    {type === 'dropdown' && options ? (
      <select
        name={name}
        value={value as string}
        onChange={onChange}
        className="p-2.5 text-base rounded border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:border-blue-500 transition duration-150"
      >
        <option value="" disabled> {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={Array.isArray(value) ? value.join(', ') : value}
        onChange={onChange}
        className="p-2.5 text-base rounded border border-gray-300 hover:border-gray-400 focus:outline-none focus:border-blue-500 transition duration-150"
      />
    )}
  </div>
);

export default InputField;
