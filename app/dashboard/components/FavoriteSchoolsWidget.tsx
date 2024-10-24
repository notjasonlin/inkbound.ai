import { useEffect, useState } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";

const FavoriteSchoolsWidget = () => {
  const supabase = createClient();
  const [favoriteSchools, setFavoriteSchools] = useState<SchoolData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setError("Failed to fetch favorite schools");
          setIsLoading(false);
          return;
        }

        if (data && data.data) {
          const schoolsData = Array.isArray(data.data) ? data.data : [];
          setFavoriteSchools(schoolsData.slice(0, 3)); // Show only the first 3 favorite schools
        } else {
          setFavoriteSchools([]);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteSchools();
  }, [supabase]);

  const getSchoolLogo = (schoolName: string) => {
    return schoolName.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return <div className="text-center text-xs">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center text-xs">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-2" style={{ maxHeight: '120%', width: '100%' }}>
      <h2 className="text-sm font-semibold text-gray-800 mb-2">Favorites</h2>

      <div className="space-y-2">
        {favoriteSchools.length > 0 ? (
          favoriteSchools.map((school, index) => (
            <div key={index} className="flex items-center space-x-2">
              {/* Placeholder circle logo */}
              <div
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold"
                style={{ flexShrink: 0 }} // Prevent shrinking of the circle
              >
                {getSchoolLogo(school.school)}
              </div>
              <span className="text-xs font-medium text-gray-800">{school.school}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center text-xs">No favorite schools found</div>
        )}

        {/* Add New Favorite */}
        <div className="flex items-center space-x-2 mt-2">
          <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-400 text-sm">
            <FaPlusCircle />
          </div>
          <span
            className="text-xs font-medium text-blue-600 cursor-pointer"
            onClick={() => window.location.href = '/dashboard/schools'}
          >
            Add New Favorite
          </span>
        </div>
      </div>
    </div>
  );
};

export default FavoriteSchoolsWidget;
