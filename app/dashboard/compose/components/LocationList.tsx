import React, { useEffect, useState } from 'react';
import { SchoolData } from '@/types/school/index';
import SchoolFolder from './SchoolFolder';

interface LocationListProps {
    schools: SchoolData[];
    onSelectSchool: (school: SchoolData) => void;
}

const LocationList: React.FC<LocationListProps> = ({ schools, onSelectSchool }) => {
    const [locations, setLocations] = useState<{ [key: string]: SchoolData[] }>({});

    useEffect(() => {
        let places: { [key: string]: SchoolData[] } = {};

        schools.forEach((school) => {
            if (!places[school.state]) {
                places[school.state] = [];
            }

            const isDuplicate = places[school.state].some(
                (existing) => existing.school === school.school
            );

            if (!isDuplicate) {
                places[school.state] = [...places[school.state], school];
            }
        });

        setLocations(places);
    }, [schools]);

    return (
        <ul className="space-y-2">
            {locations &&
                Object.entries(locations).map(([location, schoolList]) => (
                    <li key={location}>
                        <SchoolFolder
                            header={location}
                            schools={schoolList}
                            onSelectSchool={onSelectSchool}
                        />
                    </li>
                ))}
        </ul>
    );
};

export default LocationList;
