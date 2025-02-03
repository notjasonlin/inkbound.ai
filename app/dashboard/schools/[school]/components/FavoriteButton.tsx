'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoStar, IoStarOutline } from 'react-icons/io5';
import { SchoolData } from '@/types/school';
import { createClient } from '@/utils/supabase/client';
import { showToast } from '@/utils/toast';
import { v4 as uuidv4 } from 'uuid';

interface FavoriteButtonProps {
  school: SchoolData;
  userId: string;
  size?: string; // Allow customizing the size of the button
}

export default function FavoriteButton({ school, userId, size = 'text-3xl' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSuperFavorite, setIsSuperFavorite] = useState(false);
  const supabase = createClient();

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_schools')
        .select('data, super_favorites')
        .eq('uuid', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorites:', error);
        return;
      }

      const favorites = data?.data || [];
      const superFavorites = data?.super_favorites || [];

      setIsFavorite(favorites.some((f: any) => f.id === school.id));
      setIsSuperFavorite(superFavorites.includes(school.id));
    } catch (err) {
      console.error('Error fetching favorite status:', err);
    }
  }, [school.id, userId, supabase]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const handleFavorite = async (isSuperFav = false) => {
    try {
      const { data: existingData } = await supabase
        .from('favorite_schools')
        .select('data, super_favorites')
        .eq('uuid', userId)
        .maybeSingle();

      let favorites = existingData?.data || [];
      let superFavorites = existingData?.super_favorites || [];

      if (isSuperFav) {
        if (superFavorites.includes(school.id)) {
          superFavorites = superFavorites.filter((id: string) => id !== school.id);
        } else {
          superFavorites.push(school.id);
          if (!favorites.some((f: any) => f.id === school.id)) {
            favorites.push(school);
          }
        }
      } else {
        if (favorites.some((f: any) => f.id === school.id)) {
          favorites = favorites.filter((f: any) => f.id !== school.id);
          superFavorites = superFavorites.filter((id: string) => id !== school.id);
        } else {
          favorites.push(school);
        }
      }

      if (!existingData) {
        await supabase
          .from('favorite_schools')
          .insert({
            uuid: userId,
            data: favorites,
            super_favorites: superFavorites,
            favorite_count: favorites.length,
          });
      } else {
        await supabase
          .from('favorite_schools')
          .update({
            data: favorites,
            super_favorites: superFavorites,
            favorite_count: favorites.length,
          })
          .eq('uuid', userId);
      }

      setIsFavorite(favorites.some((f: any) => f.id === school.id));
      setIsSuperFavorite(superFavorites.includes(school.id));

      showToast(
        isSuperFav
          ? superFavorites.includes(school.id)
            ? 'Added to super favorites'
            : 'Removed from super favorites'
          : favorites.some((f: any) => f.id === school.id)
          ? 'Added to favorites'
          : 'Removed from favorites',
        'success'
      );
    } catch (error) {
      console.error('Error updating favorites:', error);
      showToast('Failed to update favorites', 'error');
    }
  };

  return (
    <div className="flex space-x-14">
      {/* Favorite Button */}
      <button
        onClick={() => handleFavorite(false)}
        className={`flex items-center justify-center w-8 h-8 rounded-full border ${
          isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-200 border-gray-300 text-gray-600'
        } shadow-md hover:shadow-lg transition-transform transform hover:scale-110 focus:outline-none`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? (
          <FaHeart className="text-xl" />
        ) : (
          <FaRegHeart className="text-xl" />
        )}
      </button>

      {/* Super Favorite Button */}
      <button
        onClick={() => handleFavorite(true)}
        className={`flex items-center justify-center w-8 h-8 rounded-full border ${
          isSuperFavorite ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-gray-200 border-gray-300 text-gray-600'
        } shadow-md hover:shadow-lg transition-transform transform hover:scale-110 focus:outline-none`}
        title={isSuperFavorite ? 'Remove from super favorites' : 'Mark as super favorite'}
      >
        {isSuperFavorite ? (
          <IoStar className="text-xl" />
        ) : (
          <IoStarOutline className="text-xl" />
        )}
      </button>
    </div>
  );
}
