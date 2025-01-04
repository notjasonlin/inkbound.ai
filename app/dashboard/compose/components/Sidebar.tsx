"use client";

import React, { useState, useEffect } from 'react';
import SchoolList from './SchoolList';
// import AddSchoolModal from './AddSchoolModal';
import Tabs from './Tabs';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import DivisionList from './DivisionList';
import LocationList from './LocationList';
import { FaBars, FaTimes } from 'react-icons/fa'; // Icons for sidebar toggle
import { motion } from 'framer-motion'; // Framer motion for smoother animations

interface SidebarProps {
  onSelectSchool: (school: SchoolData) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectSchool }) => {
  const supabase = createClient();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Division' | 'Location'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state for mobile

  useEffect(() => {
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
          setError("No Schools Found");
          setIsLoading(false);
          return;
        }

        if (data && data.data) {
          const schoolsData = Array.isArray(data.data) ? data.data : [];
          setSchools(schoolsData);
          setFilteredSchools(schoolsData);
        } else {
          setSchools([]);
          setFilteredSchools([]);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteSchools();
  }, [supabase]);

  useEffect(() => {
    const filtered = searchQuery
      ? schools.filter(school =>
          school.school.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : schools;

    setFilteredSchools(filtered);
  }, [searchQuery, schools]);

  const handleAddSchool = async (newSchool: SchoolData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to add a school");
        return;
      }

      const updatedSchools = [...schools, newSchool];
      setSchools(updatedSchools);

      const { error } = await supabase
        .from("favorite_schools")
        .update({ data: updatedSchools })
        .eq("uuid", user.id);

      if (error) {
        setError("Failed to add school");
      }

      setIsModalOpen(false);
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const SchoolDisplay = () => {
    if (filteredSchools.length === 0) {
      return <p className="text-gray-500 text-center py-4">You haven't favorited any schools yet</p>;
    }

    if (activeTab === 'All') {
      return <SchoolList schools={filteredSchools} onSelectSchool={onSelectSchool} />;
    } else if (activeTab === 'Division') {
      return <DivisionList schools={filteredSchools} onSelectSchool={onSelectSchool} />;
    } else if (activeTab === 'Location') {
      return <LocationList schools={filteredSchools} onSelectSchool={onSelectSchool} />;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden p-4 fixed top-4 left-4">
        <button
          className="text-white bg-blue-500 px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
          <span>{isSidebarOpen ? 'Close' : 'Open'} School Selector</span>
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 md:static md:block md:w-80 w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-blue-900">Favorite Schools</h2>
        </div>

        {/* Tabs for 'All', 'Division', 'Location' */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Search Box */}
        <div className="p-4">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Schools List based on Active Tab */}
        <div className="flex-1 overflow-y-auto p-4">
          <SchoolDisplay />
        </div>

        {/* Add School Button */}
        <div className="p-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          >
            Add School
          </button>
        </div>

        {/* MUST FIX LATER!!!!!!!!!!! */}
        {/* {isModalOpen && (
          <AddSchoolModal
            onAddSchool={handleAddSchool}
            onClose={() => setIsModalOpen(false)}
          />
        )} */}
      </motion.aside>

      {/* Background overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <motion.div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 "
          onClick={() => setIsSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </>
  );
};

export default Sidebar;
