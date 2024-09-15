import React, { useEffect, useState } from 'react';
import { SchoolData } from '@/types/school/index';
import SchoolFolder from './SchoolFolder';

interface DivisionListProps {
    schools: SchoolData[];
    onSelectSchool: (school: SchoolData) => void;
}

const DivisionList: React.FC<DivisionListProps> = ({ schools, onSelectSchool }) => {
    const [divisions, setDivisions] = useState<{ [key: string]: SchoolData[] }>({});

    useEffect(() => {
        let divs: { [key: string]: SchoolData[] } = {};

        schools.forEach((school) => {
            if (!divs[school.division]) {
                divs[school.division] = [];
            }

            const isDuplicate = divs[school.division].some(
                (existing) => existing.name === school.name
            );

            if (!isDuplicate) {
                divs[school.division] = [...divs[school.division], school];
            }
        });

        setDivisions(divs);
    }, [schools]);

    return (
        <ul className="space-y-2">
            {divisions &&
                Object.entries(divisions).map(([division, schoolList]) => (
                    <li key={division}>
                        <SchoolFolder
                            header={"Division " + division}
                            schools={schoolList}
                            onSelectSchool={onSelectSchool}
                        />
                    </li>
                ))}
        </ul>
    );
};

export default DivisionList;
