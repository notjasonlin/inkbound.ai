/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '../components/Navbar';
import { SchoolData } from '@/types/school';
import { AiFillCloseCircle } from 'react-icons/ai';
import { motion } from 'framer-motion';

const supabase = createClient();

function formatSchoolNameForImage(name: string): string {
  return name.split(' ').join('-');
}

export default function FavoriteSchools() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});
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
          setError('Add your first school to get started.');
        } else if (data && data.data) {
          const schoolsData = Array.isArray(data.data) ? data.data : [];
          setSchools(schoolsData);

          // Fetch logos
          const urls: Record<string, string> = {};
          await Promise.all(
            schoolsData.map(async (school: SchoolData) => {
              const formattedName = formatSchoolNameForImage(school.school);
              const path = `merged_school_images/${formattedName}.png`;

              try {
                const { data } = supabase.storage.from('school-logo-images').getPublicUrl(path);
                urls[school.school] = data?.publicUrl || '/fallback-logo.png';
              } catch {
                urls[school.school] = '/fallback-logo.png';
              }
            })
          );

          setLogoUrls(urls);
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
  }, []);

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
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Favorite Schools</h1>
        <p className="mb-6 text-gray-600">
          Manage and keep track of your favorite schools here.
        </p>

        {isLoading ? (
          <div className="text-center text-gray-600">Loading...</div>
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
                  className="relative bg-white border border-gray-200 shadow-lg rounded-lg p-6 transform transition-all duration-300 hover:shadow-xl"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <img
                        src={logoUrls[school.school] || '/fallback-logo.png'}
                        alt={school.school}
                        className="w-12 h-12 object-contain rounded-full border border-gray-200"
                      />
                      <h2 className="text-lg font-semibold text-blue-800">{school.school}</h2>
                    </div>
                    <button
                      onClick={() => handleRemoveSchool(school.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <AiFillCloseCircle size={24} />
                    </button>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    {school.division && <p>Division: {school.division}</p>}
                    {school.state && <p>Location: {school.state}</p>}
                    {school.conference && <p>Conference: {school.conference}</p>}
                  </div>
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
