import React, { useState, useEffect } from 'react';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import { FiChevronRight, FiChevronDown, FiMenu } from "react-icons/fi";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
          <button
            onClick={() => handleFolderToggle(name)}
            className="flex items-center space-x-2 text-gray-800 font-semibold"
          >
            {isOpen ? <FiChevronDown /> : <FiChevronRight />}
            <span>{name}</span>
          </button>
          <div className="flex space-x-2">
            <button onClick={() => handleCheckAll(schools)} className="text-sm text-blue-500 hover:underline">
              Check All
            </button>
            <button onClick={() => handleUncheckAll(schools)} className="text-sm text-blue-500 hover:underline">
              Uncheck All
            </button>
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
                <span className="text-gray-700">{school.school}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <>
      {/* Button to toggle sidebar on mobile */}
      <div className="p-4 fixed top-4 left-4 md:hidden">
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <FiMenu />
          <span>{isSidebarOpen ? 'Close' : 'Open'} School Selector</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transform transition-transform duration-300 md:w-80 w-full ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:h-auto`}
      >
        <div className="p-4 border-b border-blue-200">
          <h2 className="text-xl font-bold text-blue-800">Schools</h2>
        </div>
        <div className="p-4">
          <input
            type="text"
            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex mb-4 px-4 space-x-2">
          {['All', 'Division', 'Location'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'All' | 'Division' | 'Location')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(groupedSchools).map(([name, schools]) => (
            <SchoolFolder key={name} name={name} schools={schools} />
          ))}
        </div>
      </aside>

      {/* Overlay to close sidebar on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
