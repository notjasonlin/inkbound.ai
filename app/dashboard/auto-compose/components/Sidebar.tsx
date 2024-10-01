import React, { useState, useEffect } from 'react';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import { FiChevronRight, FiChevronDown, FiMenu } from "react-icons/fi"; // For menu icons
import { FaChevronDown } from 'react-icons/fa';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Toggle state for sidebar
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
        setError("Please log in to view favorite schools");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorite_schools")
        .select("data")
        .eq("uuid", user.id)
        .single();

      if (error) {
        setError("Failed to fetch favorite schools");
        setIsLoading(false);
        return;
      }

      if (data && data.data) {
        const schoolsData = Array.isArray(data.data) ? data.data : [];
        setSchools(schoolsData);
      } else {
        setSchools([]);
      }
    } catch (err) {
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
    <>
      {/* Button to toggle sidebar on mobile */}
      <div className="p-4 fixed top-0 left-0 z-50 md:hidden">
        <button
          className="text-gray-600 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? 'Close School Selector' : 'Open School Selector'}
          <FaChevronDown className="inline ml-2" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transform transition-transform duration-300 md:w-80 w-full ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
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
        <div className="flex mb-4 px-4">
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

      {/* Overlay to close sidebar on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
