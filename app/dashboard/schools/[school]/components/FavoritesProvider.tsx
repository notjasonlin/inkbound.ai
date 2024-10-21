'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const FavoritesContext = createContext<any>(null);

export function FavoritesProvider({ children, userId }: { children: React.ReactNode, userId: string }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('school_id')
      .eq('user_id', userId);
    
    if (data) {
      setFavorites(data.map(fav => fav.school_id));
    }
  };

  const toggleFavorite = async (schoolId: string) => {
    const isFavorite = favorites.includes(schoolId);
    
    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, school_id: schoolId });
      setFavorites(favorites.filter(id => id !== schoolId));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, school_id: schoolId });
      setFavorites([...favorites, schoolId]);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);

export default FavoritesProvider;
