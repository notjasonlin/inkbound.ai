"use client";

import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { SchoolData } from "@/types/school/index";
import { createClient } from "@/utils/supabase/client";

// A simple variant for the items
const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

export default function FavoriteSchoolsWidget() {
  const supabase = createClient();
  const [favoriteSchools, setFavoriteSchools] = useState<SchoolData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteSchools = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

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
          setFavoriteSchools(schoolsData.slice(0, 3)); // show only 3
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

  const getSchoolLogo = (schoolName: string) =>
    schoolName.charAt(0).toUpperCase();

  const handleAddFavorite = () => {
    window.location.href = "/dashboard/schools";
  };

  return (
    <motion.div
      // Animate the entire card in
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        relative
        bg-white
        border
        border-gray-200
        rounded-lg
        shadow-sm
        p-4
        md:p-6
        text-gray-700
        w-full
        flex
        flex-col
        space-y-4
      "
    >
      <h2 className="text-base md:text-lg font-bold text-gray-800">
        Favorite Schools
      </h2>

      {/* Loading, error, or school list */}
      {isLoading ? (
        <div className="text-sm text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-sm text-center text-red-500">{error}</div>
      ) : (
        <AnimatePresence>
          {favoriteSchools.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {favoriteSchools.map((school, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="
                    flex
                    items-center
                    space-x-3
                    bg-gray-100
                    hover:bg-gray-200
                    rounded-md
                    py-2
                    px-3
                    transition
                    cursor-pointer
                  "
                >
                  <div
                    className="
                      w-8 h-8
                      rounded-full
                      bg-blue-500
                      flex
                      items-center
                      justify-center
                      text-white
                      text-sm
                      font-bold
                      flex-shrink-0
                    "
                  >
                    {getSchoolLogo(school.school)}
                  </div>
                  <span className="text-sm md:text-base font-medium text-gray-800">
                    {school.school}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-center text-gray-500">
              No favorite schools found
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Add New Favorite */}
      <div className="flex items-center space-x-3 pt-2">
        <div
          className="
            w-8
            h-8
            rounded-full
            flex
            items-center
            justify-center
            border-2 border-gray-300
            text-gray-400
            hover:text-blue-500
            transition
            cursor-pointer
          "
          onClick={handleAddFavorite}
        >
          <FaPlusCircle />
        </div>
        <button
          onClick={handleAddFavorite}
          className="
            text-sm
            font-medium
            text-blue-600
            hover:underline
            transition
          "
        >
          Add New Favorite
        </button>
      </div>
    </motion.div>
  );
}
