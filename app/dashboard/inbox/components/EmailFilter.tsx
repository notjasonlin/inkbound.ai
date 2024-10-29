import React from 'react';

interface EmailFilterProps {
  coachEmails: Record<string, string>;
  onSelectCoach: (email: string) => void;
}

export default function EmailFilter({ coachEmails, onSelectCoach }: EmailFilterProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Filter by Coach</h2>
      <select 
        className="w-full p-2 border rounded"
        onChange={(e) => onSelectCoach(e.target.value)}
        defaultValue={Object.values(coachEmails)[0] || ''}
      >
        {Object.entries(coachEmails).map(([coach, email]) => (
          <option key={email} value={email}>
            {coach} ({email})
          </option>
        ))}
      </select>
    </div>
  );
}
