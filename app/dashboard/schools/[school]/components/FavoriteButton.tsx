'use client';

import { useCallback, useEffect, useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { createClient } from "@/utils/supabase/client";
import { debounce } from 'lodash';
import { SchoolData } from "@/types/school/index";

interface FavoriteButtonProps {
    userId: string;
    schoolData: SchoolData;
}

export default function FavoriteButton({ userId, schoolData }: FavoriteButtonProps) {
    const supabase = createClient();
    const [favsObj, setFavsObj] = useState<SchoolData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [favorite, setFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkFav = async () => {
            setIsLoading(true);
            console.log("Checking favorites for user:", userId);

            let { data, error } = await supabase
                .from("favorite_schools")
                .select("data")
                .eq("uuid", userId)
                .single();

            if (error && error.code === 'PGRST116') {
                console.log("No existing row, creating new one");
                const insertResult = await supabase
                    .from("favorite_schools")
                    .insert({ uuid: userId, data: [] })
                    .select()
                    .single();
                
                if (insertResult.error) {
                    console.error("Error creating new row:", insertResult.error);
                    setIsLoading(false);
                    return;
                }
                data = insertResult.data;
            } else if (error) {
                console.error("Error checking favorites:", error);
                setIsLoading(false);
                return;
            }

            console.log("Received data:", data);

            if (data && data.data) {
                const favs = Array.isArray(data.data) ? data.data : [];
                setFavsObj(favs);
                const isFavorite = favs.some(
                    (favSchool: SchoolData) => favSchool.school === schoolData.school
                );
                console.log("Is favorite:", isFavorite);
                setFavorite(isFavorite);
            } else {
                console.log("No data received or empty data");
                setFavsObj([]);
                setFavorite(false);
            }
            setIsLoading(false);
        }
        checkFav();
    }, [schoolData, userId, supabase]);

    const toggleFavorite = useCallback(async (newData: SchoolData[]) => {
        setError(null);

        try {
            const { data, error } = await supabase
                .from("favorite_schools")
                .update({ data: newData })
                .eq("uuid", userId)
                .select();

            if (error) {
                console.error("Error updating favorites:", error);
            } else {
                setFavsObj(newData);
                setFavorite(newData.some(fav => fav.school === schoolData.school));
            }

        } catch (error) {
            console.error('Error saving favorites:', error);
            setError('Failed to save favorites. Please try again.');
        }
    }, [userId, supabase, schoolData.school]);

    const debouncedSave = useCallback(debounce(toggleFavorite, 1000), [toggleFavorite]);

    const updateFavorite = () => {
        const updatedFavs = favorite
            ? favsObj.filter((fav) => fav.school !== schoolData.school) // Remove favorite
            : [...favsObj, schoolData]; // Add favorite

        setFavorite(!favorite);
        setFavsObj(updatedFavs);
        debouncedSave(updatedFavs);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex items-center space-x-2">
            <button onClick={updateFavorite} disabled={isLoading}>
                <AiFillHeart color={favorite ? "red" : "black"} size={33} />
            </button>
        </div>
    );
}