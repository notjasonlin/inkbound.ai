"use client";

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { FiSearch, FiX } from "react-icons/fi";

interface School {
  id: string;
  name: string;
}

interface SchoolSelectorProps {
  onSelectSchool: (school: School) => void;
}

export default function SchoolSelector({ onSelectSchool }: SchoolSelectorProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        .select('school_id, school_name')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching schools:', error);
        setIsLoading(false);
        return;
      }

      const schoolList = data.map((item: { school_id: string, school_name: string }) => ({
        id: item.school_id,
        name: item.school_name ? item.school_name : item.school_id, // Replace with school name if available
      }));

      setSchools(schoolList);
      setIsLoading(false);
    }

    fetchSchools();
  }, [supabase]);

  const handleSchoolClick = (school: School) => {
    setSelectedSchool(school);
    onSelectSchool(school);
    setIsModalOpen(false);
  };

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-left"
      >
        {selectedSchool && selectedSchool.name ? `Selected School: ${selectedSchool.name}` : 'Select a School'}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Select a School</h2>
            <div className="relative mb-4">
              <FiSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schools..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            {isLoading ? (
              <div className="text-center text-gray-600">Loading schools...</div>
            ) : filteredSchools.length > 0 ? (
              <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {filteredSchools.map((school) => (
                  <li
                    key={school.id}
                    className={`p-3 hover:bg-blue-100 cursor-pointer transition-colors duration-300 ${
                      selectedSchool?.id === school.id ? 'bg-blue-200' : ''
                    }`}
                    onClick={() => handleSchoolClick(school)}
                  >
                    <span className="text-blue-900 font-medium">{school.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-600">No schools found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
