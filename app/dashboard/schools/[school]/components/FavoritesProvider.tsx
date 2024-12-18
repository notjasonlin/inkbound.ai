'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SchoolData } from '@/types/school/index';

interface FavoritesContextType {
  favorites: SchoolData[];
  toggleFavorite: (school: SchoolData) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children, userId }: { children: React.ReactNode, userId: string }) {
  const [favorites, setFavorites] = useState<SchoolData[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('favorite_schools')
      .select('data')
      .eq('uuid', userId)
      .single();

    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    if (data?.data) {
      setFavorites(Array.isArray(data.data) ? data.data : []);
    }
  };

  const toggleFavorite = async (school: SchoolData) => {
    try {
      const updatedFavorites = [...favorites];
      const schoolIndex = updatedFavorites.findIndex(s => s.id === school.id);

      if (schoolIndex > -1) {
        updatedFavorites.splice(schoolIndex, 1);
      } else {
        updatedFavorites.push(school);
      }

      const { error } = await supabase
        .from('favorite_schools')
        .upsert({
          uuid: userId,
          data: updatedFavorites
        }, { onConflict: 'uuid' });

      if (error) throw error;
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesProvider;
