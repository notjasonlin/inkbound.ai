"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '../components/Navbar';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import FavoriteButton from '../[school]/components/FavoriteButton';

// First, add an interface for the AWS recommendation structure
interface AWSRecommendation {
  id: string;
  school_name: string;
  division: string;
  state: string;
  conference: string;
}

interface CoachEmail {
  name: string;
  position: string;
  email: string;
}

interface SchoolCoachEmails {
  id: string;
  school_id: string;
  coach_emails: string[];
}

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
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('Please log in to view recommended schools');
          setIsLoading(false);
          return;
        }

        setUser(user);

        const { data: awsData, error } = await supabase
          .from('AWS-reccomend_list_of_recs')
          .select('recommendations')
          .eq('user_id', user.id)
          .single();

        if (error) {
          setError('Complete your background profile to receive recommendations.');
          return;
        }

        if (!awsData?.recommendations?.length) {
          setError('No recommendations found. Complete your background profile to receive recommendations.');
          return;
        }

        const schoolIds = awsData.recommendations.map((school: AWSRecommendation) => school.id);

        const { data: coachesData, error: coachesError } = await supabase
          .from('school_coach_emails')
          .select('school_id, coach_emails')
          .in('school_id', schoolIds);

        if (coachesError) {
          console.error('Error fetching data:', coachesError);
        }

        // Create a map of school_id to coach emails
        const coachesMap = (coachesData || []).reduce((acc: { [key: string]: string[] }, schoolCoaches) => {
          if (schoolCoaches.coach_emails && Array.isArray(schoolCoaches.coach_emails)) {
            acc[schoolCoaches.school_id] = schoolCoaches.coach_emails;
          }
          return acc;
        }, {});

        const transformedRecommendations = awsData.recommendations.map((school: AWSRecommendation) => {
          const schoolCoachEmails = coachesMap[school.id] || [];
          
          const coaches = schoolCoachEmails.map(email => ({
            name: '', 
            position: '', // We don't have this info
            email: email
          }));

          return {
            Email: school.id,
            School: school.school_name,
            State: school.state,
            Division: school.division,
            Conference: school.conference,
            Name: '', 
            Position: '', // We don't have positions
            City: '',
            Biography: '',
            coaches: coaches
          };
        });

        setRecommendations(transformedRecommendations);
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

      const { data: existingFavorites, error: fetchError } = await supabase
        .from('favorite_schools')
        .select('data')
        .eq('uuid', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching favorite schools:", fetchError);
        throw fetchError;
      }

      const currentFavorites = existingFavorites?.data || [];
      const isAlreadyFavorite = currentFavorites.some((s: any) => s.id === school.id);

      if (isAlreadyFavorite) {
        setError("This school is already in your favorites.");
        return;
      }

      // Add the school to favorites
      const updatedFavorites = [...currentFavorites, school];
      const { error: upsertError } = await supabase
        .from('favorite_schools')
        .upsert(
          { uuid: user.id, data: updatedFavorites },
          { onConflict: 'uuid' }
        );

      if (upsertError) throw upsertError;

      const updatedRecommendations = recommendations.filter((s) => s.id !== school.id);
      setRecommendations(updatedRecommendations);

      const { error: updateError } = await supabase
        .from('AWS-reccomend_list_of_recs')
        .update({ recommendations: updatedRecommendations })
        .eq('user_id', user.id);

      if (updateError) {
        console.error("Error updating recommendations:", updateError);
        throw updateError;
      }

      setError(null); 
    } catch (error) {
      console.error("Failed to add to favorites:", error);
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
          <div className="text-center">
            <p className="mb-4">{error}</p>
            {error.includes('Complete your background profile') && (
              <button
                onClick={() => router.push('/dashboard/profile/background')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Profile
              </button>
            )}
          </div>
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
                <div className="flex flex-col h-full">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <FavoriteButton 
                      school={{
                        id: school.Email,
                        state: school.State,
                        school: school.School,
                        coaches: school.coaches,
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
                  <div className="pr-20">
                    <h2 className="text-lg font-semibold text-blue-800 mb-4">
                      {school.School}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Division: {school.Division || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Conference: {school.Conference || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Location: {school.State}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
