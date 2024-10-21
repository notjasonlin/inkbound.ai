import React, { useState, useEffect } from 'react';
import { CoachData, SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";

interface AddSchoolModalProps {
  onAddSchool: (school: SchoolData) => void;
  onClose: () => void;
}

interface CoachInformation {
  id: string;
  school: string;
  confrence: string;
  division: string;
  state: string;
  name: string;
  position: string;
  email: string;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ onAddSchool, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [unfiltered, setUnfiltered] = useState<CoachInformation[]>([]); // Unfiltered list for handling coach info
  const [searchResults, setSearchResults] = useState<CoachInformation[]>([]);
  const [allSchools, setAllSchools] = useState<CoachInformation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Error handling state
  const supabase = createClient();

  useEffect(() => {
    fetchAllSchools();
  }, []);

  const fetchAllSchools = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('coachinformation').select('*');
      if (error) throw error;
      setAllSchools(data || []);
    } catch (error) {
      setError('Error fetching schools');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setError(null); // Reset error state

    const uniqueSchools = new Set<string>();
    const filteredSchools = allSchools.filter(school => {
      const schoolNameLower = school.school.toLowerCase();
      return schoolNameLower.includes(searchQuery.toLowerCase());
    });

    setSearchResults([...filteredSchools.filter(school => !uniqueSchools.has(school.school.toLowerCase()))]);
    setUnfiltered(filteredSchools);
  };

  const handleSelectSchool = async (school: CoachInformation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const schoolData = makeSchoolData(school);
      const { data: existingFavorites, error: fetchError } = await supabase
        .from('favorite_schools')
        .select('data')
        .eq('uuid', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const updatedFavorites = existingFavorites ? [...existingFavorites.data, schoolData] : [schoolData];

      const { error: upsertError } = await supabase
        .from('favorite_schools')
        .upsert({ uuid: user.id, data: updatedFavorites }, { onConflict: 'uuid' });

      if (upsertError) throw upsertError;

      onAddSchool(schoolData);
      onClose();
    } catch (error) {
      console.error('Error adding school to favorites:', error);
      setError('Failed to add school to favorites');
    }
  };

  const makeSchoolData = (school: CoachInformation) => {
    const allCoaches = unfiltered.filter(data => data.school === school.school);
    const coaches: CoachData[] = allCoaches.map(data => ({
      name: data.name,
      email: data.email,
      position: data.position
    }));

    return {
      id: school.id,
      school: school.school,
      coaches,
      division: school.division,
      state: school.state,
      conference: school.confrence
    };
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
        <h3 className="text-lg font-semibold mb-4">Add a New School</h3>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
          placeholder="Search for a school..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Search'}
        </button>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-600 text-center">Loading schools...</p>
          ) : searchResults.length > 0 ? (
            <ul className="space-y-2">
              {searchResults.map(school => (
                <li
                  key={school.id}
                  className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSelectSchool(school)}
                >
                  {school.school}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center">No results found.</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AddSchoolModal;
