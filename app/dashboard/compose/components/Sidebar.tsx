import React, { useState, useEffect } from 'react';
import SchoolList from './SchoolList';
import AddSchoolModal from './AddSchoolModal';
import Tabs from './Tabs';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import DivisionList from './DivisionList';
import LocationList from './LocationList';

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

  useEffect(() => {
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
          setFilteredSchools(schoolsData);
        } else {
          console.log("No schools data found, setting empty array");
          setSchools([]);
          setFilteredSchools([]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteSchools();
  }, [supabase]);

  useEffect(() => {
    // Filter schools based on search query
    let filtered = schools;

    if (searchQuery) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
        console.error("Error updating favorite schools:", error);
        setError("Failed to add school");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Conditionally render SchoolDisplay based on the activeTab
  const SchoolDisplay = () => {
    if (activeTab === 'All') {
      return <SchoolList schools={filteredSchools} onSelectSchool={onSelectSchool} />;
    } else if (activeTab === 'Division') {
      return <DivisionList schools={filteredSchools} onSelectSchool={onSelectSchool} />;
    } else if (activeTab === 'Location') {
      // Placeholder for location-based filtering, assuming you would implement it later
      return <LocationList schools={filteredSchools} onSelectSchool={onSelectSchool} />;
    }
    return null;
  };

  return (
    <aside className="w-80 bg-white shadow-md flex flex-col">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Favorites</h2>
      </div>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-4">
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Search schools..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <SchoolDisplay />
      </div>

      <div className="p-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Add School
        </button>
      </div>

      {isModalOpen && <AddSchoolModal onAddSchool={handleAddSchool} onClose={() => setIsModalOpen(false)} />}
    </aside>
  );
};

export default Sidebar;
