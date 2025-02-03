import { SchoolData } from "@/types/school";
import { useState } from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

interface SchoolFolderProps {
    header: string;
    schools: SchoolData[];
    onSelectSchool: (school: SchoolData) => void;
}

const SchoolFolder: React.FC<SchoolFolderProps> = ({
  header,
  schools,
  onSelectSchool,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFolder = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleSchoolSelect = (school: SchoolData) => {
    onSelectSchool(school);
  };

  return (
    <>
      <button onClick={toggleFolder} className="flex items-center space-x-2 mb-2">
        {isOpen ? <FiChevronDown /> : <FiChevronRight />}
        <h1 className="text-lg font-bold">{header}</h1>
      </button>

      {isOpen && (
        <ul className="pl-4 space-y-1">
          {schools.map((school) => (
            <li
              key={school.id}
              onClick={() => handleSchoolSelect(school)}
              className="px-3 py-2 bg-blue-100 rounded-r-lg 
                         cursor-pointer hover:bg-gray-200"
            >
              {school.school}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default SchoolFolder;
