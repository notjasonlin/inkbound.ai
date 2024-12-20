'use client';

import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { SchoolData } from "@/types/school/index";
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { FavoriteSchoolsData } from '@/types/favorite_schools';
import { IoStar, IoStarOutline } from "react-icons/io5";


interface FavoriteButtonProps {
    school: SchoolData;
    userId: string;
}

export default function FavoriteButton({ school, userId }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isSuperFavorite, setIsSuperFavorite] = useState<boolean>(false);
    const [existingData, setExistingData] = useState<FavoriteSchoolsData>(); // create state instead of multiple calls to grab same data
    const supabase = createClient();

    useEffect(() => {
        checkFavoriteStatus();
    }, [school.id, userId]);

    async function checkFavoriteStatus() {
        const { data, error } = await supabase
            .from('favorite_schools')
            .select('data, super_favorites')
            .eq('uuid', userId)
            .single();

        if (error) {
            console.error('Error checking data:', error);
        } else {
            const isFav = data?.data?.some((s: SchoolData) => s.id === school.id) || false;
            setIsFavorite(isFav);
            const isSuperFav = data?.super_favorites?.some((id: string) => id === school.id) || false;
            setIsSuperFavorite(isSuperFav);
            const favs: FavoriteSchoolsData = {
                schools: data.data,
                super_favorites: data.super_favorites
            }
            setExistingData(favs);
        }
    }

    const toggleFavorite = async (superFavs?: string[]) => {
        try {
            let updatedData: any[] = existingData?.schools || [];
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

            const { data, error } = await supabase
                .from('personalized_messages')
                .upsert({ 'user_id': userId, 'school_id': school.id, 'school_name': school.school, 'is_super_fav': isSuperFavorite, 'is_curr_fav': isFavorite })
                .select()


            if (!superFavs && isFavorite && isSuperFavorite) {
                superFavs = changeSuperFavData();
                setIsSuperFavorite(!isSuperFavorite);
            }
            
            if (superFavs) {
                const { error: upsertError } = await supabase
                    .from('favorite_schools')
                    .upsert({
                        uuid: userId,
                        data: updatedData,
                        super_favorites: superFavs
                    }, { onConflict: 'uuid' });

                if (upsertError) throw upsertError;

            } else {
                const { error: upsertError } = await supabase
                    .from('favorite_schools')
                    .upsert({
                        uuid: userId,
                        data: updatedData
                    }, { onConflict: 'uuid' });

                if (upsertError) throw upsertError;

            }

            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling data:', error);
        }
    };

    const toggleSuperFavorite = async () => {
        const superFavs = changeSuperFavData();
        if (!isSuperFavorite && !isFavorite) {
            toggleFavorite(superFavs);
        } else {
            const { data, error } = await supabase
                .from('personalized_messages')
                .upsert({ 'user_id': userId, 'school_id': school.id, 'school_name': school.school, 'is_super_fav': isSuperFavorite, 'is_curr_fav': isFavorite })
                .select()
        }
        setIsSuperFavorite(!isSuperFavorite);
    }

    const changeSuperFavData = () => {
        let superFavs = existingData?.super_favorites ? existingData.super_favorites : [];

        if (isSuperFavorite) {
            superFavs = superFavs.filter((item: string) => item !== school.id);
        } else {
            superFavs.push(school.id);
        }
        return superFavs;
    }

    return (
        <div className="flex space-x-2">
            <Button onClick={() => toggleFavorite()} className="focus:outline-none">
                {isFavorite ? (
                    <FaHeart className="text-red-500" />
                ) : (
                    <FaRegHeart className="text-gray-500" />
                )}
            </Button>
            <Button onClick={toggleSuperFavorite} className="focus:outline-none">
                {isSuperFavorite ? (
                    <IoStar className="text-yellow-500" />
                ) : (
                    <IoStarOutline className="text-gray-500" />
                )}
            </Button>
        </div>
    );
}
