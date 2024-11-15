"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '../components/Navbar';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import FavoriteButton from '../[school]/components/FavoriteButton';

export default function RecommendedSchools() {
  const supabase = createClient();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchRecommendedSchools = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('Please log in to view recommended schools');
          setIsLoading(false);
          return;
        }

        setUser(user);

        const { data, error } = await supabase
          .from('initial_school_recs')
          .select('recommendations')
          .eq('user_id', user.id)
          .single();

        if (error) {
          setError('Failed to fetch recommended schools');
        } else if (data?.recommendations?.length > 0) {
          setRecommendations(data.recommendations);
        } else {
          setError('No recommendations found. Complete your background profile to receive recommendations.');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedSchools();
  }, [supabase]);

  const handleViewDetails = (schoolName: string) => {
    router.push(`/dashboard/schools/${encodeURIComponent(schoolName)}`);
  };

  const handleAddToFavorites = async (school: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not found');

      // Check if the school is already in the user's favorites
      const { data: existingSchool, error: checkError } = await supabase
        .from('favorite_schools')
        .select('id')
        .eq('uuid', user.id)
        .eq('data->>id', school.id) // Assuming `id` is a unique field in each school object
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking favorite school:", checkError);
        throw checkError;
      }

      // If the school is already in favorites, skip adding
      if (existingSchool) {
        setError("This school is already in your favorites.");
        return;
      }

      // Add the school to the favorite_schools table
      const { error: addError } = await supabase
        .from('favorite_schools')
        .insert([{ uuid: user.id, data: school }]);

      if (addError) throw addError;

      // Optimistically update the state
      const updatedRecommendations = recommendations.filter((s) => s.Email !== school.Email);
      setRecommendations(updatedRecommendations);

      // Update the recommendations in the initial_school_recs table
      const { error: updateError } = await supabase
        .from('initial_school_recs')
        .update({ recommendations: updatedRecommendations })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setError(null); // Clear any previous errors on success
    } catch (error) {
      console.error("Failed to add to favorites", error);
      setError("Failed to add school to favorites. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Recommended Schools</h1>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {recommendations.map((school) => (
              <motion.div
                key={school.Email}
                className="relative bg-white shadow-lg rounded-lg p-6 transform transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <FavoriteButton 
                    school={{
                      id: school.Email,
                      state: school.State,
                      school: school.School,
                      coaches: [{ 
                        name: school.Name, 
                        position: school.Position,
                        email: school.Email 
                      }],
                      division: school.Division,
                      conference: school.Conference,
                      biography: school.Biography || ''
                    }} 
                    userId={user?.id} 
                  />
                  <button
                    onClick={() => handleViewDetails(school.School)}
                    className="text-blue-400 hover:text-blue-600"
                    title="View Details"
                  >
                    <AiOutlineInfoCircle size={24} />
                  </button>
                </div>
                {/* School Details */}
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-blue-800">
                    {school.School}
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Coach: {school.Name} ({school.Position})
                </p>
                <p className="text-sm text-gray-600">
                  Division: {school.Division || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Conference: {school.Conference || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {school.City}, {school.State}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
