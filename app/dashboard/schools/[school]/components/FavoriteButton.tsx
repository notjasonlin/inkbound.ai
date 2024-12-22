'use client';

import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { SchoolData } from "@/types/school/index";
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { FavoriteSchoolsData } from '@/types/favorite_schools';
import { IoStar, IoStarOutline } from "react-icons/io5";
import { v4 as uuidv4 } from 'uuid';

interface FavoriteButtonProps {
    school: SchoolData;
    userId: string;
}

export default function FavoriteButton({ school, userId }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isSuperFavorite, setIsSuperFavorite] = useState<boolean>(false);
    const [personalizedMessageId, setPersonalizedMessageId] = useState<string | null>(null);
    const [existingData, setExistingData] = useState<FavoriteSchoolsData>(); // create state instead of multiple calls to grab same data
    const supabase = createClient();

    useEffect(() => {
        checkFavoriteStatus();
        checkPersoanlizedMessage();
    }, [school.id, userId]);

    const checkFavoriteStatus = async () => {
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

    const checkPersoanlizedMessage = async () => {
        const { data, error } = await supabase
            .from('personalized_messages')
            .select('id')
            .eq('user_id', userId)
            .eq('school_id', school.id)

        if (error) {
            console.error('Error checking data:', error);
        } else {
            const id = (data && data[0] && data[0].id) ? data[0].id : null;
            setPersonalizedMessageId(id);
        }
    }

    const toggleFavorite = async (superFavs?: string[], isSupFav?: boolean) => {
        if (existingData) {
            try {
                const updatedData = changeFavData();
                const isFav = !isFavorite;
                isSupFav = isSupFav ? isSupFav : isSuperFavorite;

                // **Change personalizedMessages**
                if (personalizedMessageId) { // If existing personalized message, update status
                    const { data, error } = await supabase
                        .from('personalized_messages')
                        .update({ 'is_super_fav': isSupFav, 'is_curr_fav': isFav })
                        .eq("id", personalizedMessageId);
                } else { // If not existing personalized message, add to supabase
                    const uuid = uuidv4();
                    const { data, error } = await supabase
                        .from('personalized_messages')
                        .insert({ 'id': uuid, 'user_id': userId, 'school_id': school.id, 'school_name': school.school, 'is_super_fav': isSupFav, 'is_curr_fav': isFav })
                        .select()
                    setPersonalizedMessageId(uuid);
                }


                // **Change data**
                if (!superFavs && !isFav && isSuperFavorite) { // If user unfavorited, but is still superFavorite, change superFav data to remove school and remove unSuperFavorite
                    superFavs = changeSuperFavData();
                    setIsSuperFavorite(!isSuperFavorite);
                }

                if (superFavs) { // If superFav data included (i.e. superFav data changed), upsert that with updatedData 
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
                setIsFavorite(isFav);
            } catch (error) {
                console.error('Error toggling data:', error);
            }
        }
    };

    const changeFavData = () => {
        if (existingData) {
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
            const changed: FavoriteSchoolsData = { schools: updatedData, super_favorites: existingData?.super_favorites }
            setExistingData(changed);
            return updatedData;
        }
    }

    const toggleSuperFavorite = async () => {
        const superFavs = changeSuperFavData();
        const isSupFav = !isSuperFavorite
        if (isSupFav && !isFavorite) {
            toggleFavorite(superFavs, isSupFav);
        } else {
            const { data, error } = await supabase
                .from('personalized_messages')
                .update({ 'is_super_fav': isSupFav, 'is_curr_fav': isFavorite })
                .eq("id", personalizedMessageId);

            const { error: updateError } = await supabase
                .from('favorite_schools')
                .update({ super_favorites: superFavs })
                .eq("uuid", userId);
        }
        setIsSuperFavorite(isSupFav);
    }

    const changeSuperFavData = () => {
        if (existingData) {
            let superFavs = existingData.super_favorites ? existingData.super_favorites : [];

            if (isSuperFavorite) {
                superFavs = superFavs.filter((item: string) => item !== school.id);
            } else {
                superFavs.push(school.id);
            }
            const changed: FavoriteSchoolsData = { schools: existingData.schools, super_favorites: superFavs }
            setExistingData(changed);
            return superFavs;
        }

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
