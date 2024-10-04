"use client";

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";

interface School {
  id: string;
  name: string;
}

export default function SchoolSidebar({ onSelectSchool }: { onSelectSchool: (schoolId: string) => void }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSchools() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('school_coach_emails')
        .select('school_id')
        .eq('user_id', user.id);

      console.log('Fetched data:', data);

      if (error) {
        console.error('Error fetching schools:', error);
        setIsLoading(false);
        return;
      }

      const schoolList = data.map((item: { school_id: string }) => ({
        id: item.school_id,
        name: item.school_id // Using school_id as name for now
      }));

      console.log('Processed school list:', schoolList);

      setSchools(schoolList);
      setIsLoading(false);
    }

    fetchSchools();
  }, [supabase]);

  const handleSchoolClick = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    onSelectSchool(schoolId);
  };

  return (
    <div className="w-64 bg-white shadow-md h-full overflow-y-auto">
      <h2 className="text-xl font-semibold p-4">Schools</h2>
      {isLoading ? (
        <p className="p-4">Loading schools...</p>
      ) : schools.length > 0 ? (
        <ul>
          {schools.map((school) => (
            <li 
              key={school.id}
              className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedSchoolId === school.id ? 'bg-blue-100' : ''}`}
              onClick={() => handleSchoolClick(school.id)}
            >
              {school.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-4">No schools found.</p>
      )}
    </div>
  );
}
