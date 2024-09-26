import React from 'react';
import { SchoolData } from '@/types/school/index';

interface SchoolSelectorProps {
  schools: SchoolData[];
  selectedSchools: SchoolData[];
  onSelectSchool: (school: SchoolData) => void;
}

const SchoolSelector: React.FC<SchoolSelectorProps> = ({ schools, selectedSchools, onSelectSchool }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Select Schools</h2>
      <div className="grid grid-cols-3 gap-4">
        {schools.map(school => (
          <div key={school.id} className="flex items-center">
            <input
              type="checkbox"
              id={school.id}
              checked={selectedSchools.some(s => s.id === school.id)}
              onChange={() => onSelectSchool(school)}
              className="mr-2"
            />
            <label htmlFor={school.id}>{school.school}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolSelector;
