import { SchoolData } from "@/types/school";
import { useState } from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

interface SchoolFolderProps {
    header: string;
    schools: SchoolData[];
    onSelectSchool: (school: SchoolData) => void;
}

const SchoolFolder: React.FC<SchoolFolderProps> = ({ header, schools, onSelectSchool }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleFolder = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleSchoolSelect = (school: SchoolData) => {
        onSelectSchool(school);
    };

    return (
        <>
            <button onClick={toggleFolder} className="flex items-center space-x-2">
                {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                <h1 className="text-lg font-bold">{header}</h1>
            </button>
            {isOpen && (
                <ul className="pl-4">
                    {schools.map((school) => (
                        <li
                            key={school.id}
                            className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSchoolSelect(school)}
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
