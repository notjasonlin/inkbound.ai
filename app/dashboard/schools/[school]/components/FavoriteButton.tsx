'use client';

import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { SchoolData } from "@/types/school/index";
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

interface FavoriteButtonProps {
    school: SchoolData;
    userId: string;
}

export default function FavoriteButton({ school, userId }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        checkFavoriteStatus();
    }, [school.id, userId]);

    async function checkFavoriteStatus() {
        const { data, error } = await supabase
            .from('favorite_schools')
            .select('data')
            .eq('uuid', userId)
            .single();

        if (error) {
            console.error('Error checking data:', error);
        } else {
            const isFav = data?.data?.some((s: SchoolData) => s.id === school.id) || false;
            setIsFavorite(isFav);
        }
    }

    const toggleFavorite = async () => {
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
                updatedData.splice(schoolIndex, 1);
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
                .upsert({ 
                    uuid: userId, 
                    data: updatedData
                }, { onConflict: 'uuid' });

            if (upsertError) throw upsertError;
            
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling data:', error);
        }
    };

    return (
        <Button onClick={toggleFavorite} className="focus:outline-none">
            {isFavorite ? (
                <FaHeart className="text-red-500" />
            ) : (
                <FaRegHeart className="text-gray-500" />
            )}
        </Button>
    );
}
