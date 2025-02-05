import React from 'react';
import { SchoolData } from '@/types/school/index';

interface SchoolListProps {
  schools: SchoolData[];
  onSelectSchool: (school: SchoolData) => void;
}

const SchoolList: React.FC<SchoolListProps> = ({ schools, onSelectSchool }) => {
  return (
    <ul className="space-y-2">
      {schools.map(school => {
        return (
          <li
            key={school.id}
            className="p-2 bg-blue-100 rounded-r-lg cursor-pointer hover:bg-gray-200"
            onClick={() => onSelectSchool(school)}
          >
            {school.school}
          </li>
        )
      })}
    </ul>
  );
};

export default SchoolList;