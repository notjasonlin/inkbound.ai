'use client';

import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { SchoolData } from "@/types/school/index";
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

interface FavoriteButtonProps {
    school: SchoolData;
    userId: string;
    size?: string; // Allow customizing the size of the button
}

export default function FavoriteButton({ school, userId, size = "text-xl" }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Track action state
    const supabase = createClient();

    useEffect(() => {
        checkFavoriteStatus();
    }, [checkFavoriteStatus, school.id, userId]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function checkFavoriteStatus() {
        try {
            const { data, error } = await supabase
                .from('favorite_schools')
                .select('data')
                .eq('uuid', userId)
                .single();

            if (error) {
                console.error('Error checking favorite status:', error);
            } else {
                const isFav = data?.data?.some((s: SchoolData) => s.id === school.id) || false;
                setIsFavorite(isFav);
            }
        } catch (err) {
            console.error('Error fetching favorite status:', err);
        }
    }

    const toggleFavorite = async () => {
        setIsProcessing(true); // Disable button during processing

        try {
            const { data: existingData, error: fetchError } = await supabase
                .from('favorite_schools')
                .select('data')
                .eq('uuid', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            let updatedData = existingData?.data || [];
            const schoolIndex = updatedData.findIndex((s: SchoolData) => s.id === school.id);

            if (schoolIndex > -1) {
                updatedData.splice(schoolIndex, 1); // Remove school from favorites
            } else {
                updatedData.push({
                    id: school.id,
                    state: school.state,
                    school: school.school,
                    coaches: school.coaches,
                    division: school.division,
                    conference: school.conference
                });
            }

            const { error: upsertError } = await supabase
                .from('favorite_schools')
                .upsert(
                    { uuid: userId, data: updatedData },
                    { onConflict: 'uuid' }
                );

            if (upsertError) throw upsertError;

            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsProcessing(false); // Re-enable button
        }
    };

    return (
        <Button
            onClick={toggleFavorite}
            disabled={isProcessing}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={clsx(
                "rounded-full p-2 transition-all duration-200",
                isProcessing
                    ? "cursor-wait"
                    : "hover:bg-red-100 focus:ring-2 focus:ring-red-300",
                "focus:outline-none"
            )}
        >
            {isFavorite ? (
                <FaHeart className={clsx("text-red-500", size, "transition-transform duration-200 scale-110")} />
            ) : (
                <FaRegHeart className={clsx("text-gray-500 hover:text-red-500", size, "transition-transform duration-200")} />
            )}
        </Button>
    );
}
