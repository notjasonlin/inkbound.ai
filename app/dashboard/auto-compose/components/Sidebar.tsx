import React, { useState, useEffect } from 'react';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

interface SidebarProps {
  onSelectSchools: (schools: SchoolData[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectSchools }) => {
  const supabase = createClient();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<SchoolData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Division' | 'Location'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchFavoriteSchools();
  }, []);

  useEffect(() => {
    onSelectSchools(selectedSchools);
  }, [selectedSchools, onSelectSchools]);

  const fetchFavoriteSchools = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user logged in");
        setError("Please log in to view favorite schools");
        setIsLoading(false);
        return;
      }

      console.log("Fetching favorite schools for user:", user.id);

      const { data, error } = await supabase
        .from("favorite_schools")
        .select("data")
        .eq("uuid", user.id)
        .single();

      if (error) {
        console.error("Error fetching favorite schools:", error);
        setError("Failed to fetch favorite schools");
        setIsLoading(false);
        return;
      }

      console.log("Received data:", data);

      if (data && data.data) {
        const schoolsData = Array.isArray(data.data) ? data.data : [];
        console.log("Setting schools:", schoolsData);
        setSchools(schoolsData);
      } else {
        console.log("No schools data found, setting empty array");
        setSchools([]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolSelection = (school: SchoolData) => {
    setSelectedSchools(prev => 
      prev.some(s => s.id === school.id)
        ? prev.filter(s => s.id !== school.id)
        : [...prev, school]
    );
  };

  const handleFolderToggle = (folderName: string) => {
    setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const handleCheckAll = (schools: SchoolData[]) => {
    setSelectedSchools(prev => {
      const newSelection = [...prev];
      schools.forEach(school => {
        if (!newSelection.some(s => s.id === school.id)) {
          newSelection.push(school);
        }
      });
      return newSelection;
    });
  };

  const handleUncheckAll = (schools: SchoolData[]) => {
    setSelectedSchools(prev => prev.filter(s => !schools.some(school => school.id === s.id)));
  };

  const filteredSchools = schools.filter(school =>
    school.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSchools = filteredSchools.reduce((acc, school) => {
    const key = activeTab === 'Division' ? school.division : activeTab === 'Location' ? school.state : 'All';
    if (!acc[key]) acc[key] = [];
    acc[key].push(school);
    return acc;
  }, {} as { [key: string]: SchoolData[] });

  const SchoolFolder: React.FC<{ name: string, schools: SchoolData[] }> = ({ name, schools }) => {
    const isOpen = openFolders[name] || false;
    const allChecked = schools.every(school => selectedSchools.some(s => s.id === school.id));

    return (
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <button onClick={() => handleFolderToggle(name)} className="flex items-center space-x-2">
            {isOpen ? <FiChevronDown /> : <FiChevronRight />}
            <span className="font-semibold">{name}</span>
          </button>
          <div>
            <button onClick={() => handleCheckAll(schools)} className="text-sm text-blue-500 mr-2">Check All</button>
            <button onClick={() => handleUncheckAll(schools)} className="text-sm text-blue-500">Uncheck All</button>
          </div>
        </div>
        {isOpen && (
          <ul className="pl-6 mt-2">
            {schools.map(school => (
              <li key={school.id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={selectedSchools.some(s => s.id === school.id)}
                  onChange={() => handleSchoolSelection(school)}
                  className="mr-2"
                />
                <span>{school.school}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <aside className="w-80 bg-white shadow-md flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Schools</h2>
      </div>
      <div className="p-4">
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Search schools..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex mb-4">
        {['All', 'Division', 'Location'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'All' | 'Division' | 'Location')}
            className={`flex-1 py-2 ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(groupedSchools).map(([name, schools]) => (
          <SchoolFolder key={name} name={name} schools={schools} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;