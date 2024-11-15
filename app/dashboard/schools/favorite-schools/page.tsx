'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '../components/Navbar';
import { SchoolData } from '@/types/school';
import { AiFillCloseCircle } from 'react-icons/ai';
import { motion } from 'framer-motion';

export default function FavoriteSchools() {
  const supabase = createClient();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteSchools = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('Please log in to view favorite schools');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('favorite_schools')
          .select('data')
          .eq('uuid', user.id)
          .single();

        if (error) {
          setError('Failed to fetch favorite schools');
        } else if (data && data.data) {
          const schoolsData = Array.isArray(data.data) ? data.data : [];
          setSchools(schoolsData);
        } else {
          setSchools([]);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteSchools();
  }, [supabase]);

  const handleRemoveSchool = async (schoolId: string) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('Please log in to remove a school');
        return;
      }

      const updatedSchools = schools.filter((school) => school.id !== schoolId);
      setSchools(updatedSchools);

      const { error } = await supabase
        .from('favorite_schools')
        .update({ data: updatedSchools })
        .eq('uuid', user.id);

      if (error) {
        setError('Failed to remove the school');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Your Favorite Schools</h1>
        <p className="mb-6 text-gray-700">
          Manage and keep track of your favorite schools here.
        </p>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {schools.length > 0 ? (
              schools.map((school) => (
                <motion.div
                  key={school.id}
                  className="relative bg-white shadow-lg rounded-lg p-6 transform transition-all duration-300 hover:scale-105"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-blue-800">
                      {school.school}
                    </h2>
                    <button
                      onClick={() => handleRemoveSchool(school.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <AiFillCloseCircle size={24} />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {school.division ? `Division: ${school.division}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {school.state ? `Location: ${school.state}` : ''}
                  </p>
                  {school.conference && (
                    <p className="mt-1 text-sm text-gray-600">
                      Conference: {school.conference}
                    </p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600">
                No favorite schools found.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
