'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { SchoolData } from "@/types/school/index";
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { IoStar, IoStarOutline } from "react-icons/io5";
import { showToast } from '@/utils/toast';
import { v4 as uuidv4 } from 'uuid';

interface FavoriteButtonProps {
    school: SchoolData;
    userId: string;
}

export default function FavoriteButton({ school, userId }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isSuperFavorite, setIsSuperFavorite] = useState<boolean>(false);
    const supabase = createClient();

    const checkFavoriteStatus = useCallback(async () => {
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
        setIsSuperFavorite(Array.isArray(superFavorites) && superFavorites.includes(school.id));
    }, [school.id, userId, supabase]);

    useEffect(() => {
        checkFavoriteStatus();
    }, [checkFavoriteStatus]);

    const handlePersonalizedMessage = async (isSuperFav: boolean, isFav: boolean) => {
        try {
            // Check if personalized message exists
            const { data: existingMessage } = await supabase
                .from('personalized_messages')
                .select('id')
                .eq('user_id', userId)
                .eq('school_id', school.id)
                .maybeSingle();

            if (existingMessage) {
                // Update existing message
                await supabase
                    .from('personalized_messages')
                    .update({
                        is_super_fav: isSuperFav,
                        is_curr_fav: isFav,
                        needs_handwritten: isSuperFav
                    })
                    .eq('id', existingMessage.id);
            } else if (isFav) {
                // Create new message only if favorited
                const messageId = uuidv4();
                await supabase
                    .from('personalized_messages')
                    .insert({
                        id: messageId,
                        user_id: userId,
                        school_id: school.id,
                        school_name: school.school,
                        is_super_fav: isSuperFav,
                        is_curr_fav: isFav,
                        needs_handwritten: isSuperFav,
                        message: ''
                    });
            }
        } catch (error) {
            console.error('Error managing personalized message:', error);
            throw error;
        }
    };

    const handleFavorite = async (isSuperFav: boolean = false) => {
        try {
            const { data: existingData, error: fetchError } = await supabase
                .from('favorite_schools')
                .select('data, super_favorites')
                .eq('uuid', userId)
                .maybeSingle();

            let favorites = existingData?.data || [];
            let superFavorites = Array.isArray(existingData?.super_favorites) 
                ? existingData.super_favorites 
                : [];

            if (isSuperFav) {
                // Handle super favorite toggle
                if (superFavorites.includes(school.id)) {
                    // Remove from super favorites
                    superFavorites = superFavorites.filter((id: string) => id !== school.id);
                } else {
                    // Add to super favorites
                    superFavorites = [...superFavorites, school.id];
                    // Ensure school is in favorites when super favorited
                    if (!favorites.some((f: any) => f.id === school.id)) {
                        favorites = [...favorites, {
                            id: school.id,
                            state: school.state,
                            school: school.school,
                            coaches: school.coaches,
                            division: school.division,
                            conference: school.conference
                        }];
                    }
                }
            } else {
                // Handle regular favorite toggle
                if (favorites.some((f: any) => f.id === school.id)) {
                    // Remove from favorites
                    favorites = favorites.filter((f: any) => f.id !== school.id);
                    // Also remove from super favorites if exists
                    superFavorites = superFavorites.filter((id: string) => id !== school.id);
                } else {
                    // Add to favorites
                    favorites = [...favorites, {
                        id: school.id,
                        state: school.state,
                        school: school.school,
                        coaches: school.coaches,
                        division: school.division,
                        conference: school.conference
                    }];
                }
            }

            // If no existing entry, insert new one
            if (!existingData) {
                const { error: insertError } = await supabase
                    .from('favorite_schools')
                    .insert({
                        uuid: userId,
                        data: favorites,
                        super_favorites: superFavorites,
                        favorite_count: favorites.length
                    });

                if (insertError) throw insertError;
            } else {
                // Update existing entry
                const { error: updateError } = await supabase
                    .from('favorite_schools')
                    .update({
                        data: favorites,
                        super_favorites: superFavorites,
                        favorite_count: favorites.length
                    })
                    .eq('uuid', userId);

                if (updateError) throw updateError;
            }

            // Update personalized messages
            const isFav = favorites.some((f: any) => f.id === school.id);
            await handlePersonalizedMessage(
                superFavorites.includes(school.id),
                isFav
            );

            // Update local state
            if (isSuperFav) {
                const newSuperFavStatus = !isSuperFavorite;
                setIsSuperFavorite(newSuperFavStatus);
                if (newSuperFavStatus) setIsFavorite(true);
            } else {
                const newFavStatus = !isFavorite;
                setIsFavorite(newFavStatus);
                if (!newFavStatus) setIsSuperFavorite(false);
            }

            showToast(
                isSuperFav 
                    ? (isSuperFavorite ? 'Removed from super favorites' : 'Added to super favorites')
                    : (isFavorite ? 'Removed from favorites' : 'Added to favorites'),
                'success'
            );

            // Refresh the favorite status
            checkFavoriteStatus();
        } catch (error) {
            console.error('Error updating favorites:', error);
            showToast('Failed to update favorites', 'error');
        }
    };

    return (
        <div className="flex space-x-2">
            <Button 
                onClick={() => handleFavorite(false)} 
                className="focus:outline-none"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                {isFavorite ? (
                    <FaHeart className="text-red-500" />
                ) : (
                    <FaRegHeart className="text-gray-500" />
                )}
            </Button>
            <Button 
                onClick={() => handleFavorite(true)} 
                className="focus:outline-none"
                title={isSuperFavorite ? "Remove super favorite" : "Mark as super favorite"}
            >
                {isSuperFavorite ? (
                    <IoStar className="text-yellow-500" />
                ) : (
                    <IoStarOutline className="text-gray-500" />
                )}
            </Button>
        </div>
    );
}
