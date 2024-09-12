'use client';

import { useCallback, useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { createClient } from "@/utils/supabase/client";
import { debounce } from 'lodash';


interface FavoriteButtonProps {
    userId: string;
    // allFavorites: any;
    schoolData: SchoolData;
}

export default function FavoriteButton({ userId, schoolData }: FavoriteButtonProps) {
    const supabase = createClient();
    const [favsObj, setFavsObj] = useState<SchoolData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [favorite, setFavorite] = useState(false);


    useEffect(() => {
        // Parse allFavorites and check if the passed schoolData is in the array

        const checkFav = async () => {
            const { data, error } = await supabase
                .from("favorite_schools")
                .select("data")
                .eq("uuid", userId)
                .single();

            try {
                if (data) {
                    const isFavorite = data.data.some(
                        (favSchool: SchoolData) => favSchool.name === schoolData.name
                    );
                    console.log("ISFAVORITE", isFavorite);

                    setFavorite(isFavorite);
                }
            } catch (error) {
                console.error("Invalid JSON:", error);
            }
        }

    }, [schoolData]);

    const toggleFavorite = useCallback(async (newData: SchoolData[]) => {
        setError(null);

        try {
            const { data, error } = await supabase
                .from("favorite_schools")
                .update({ data: newData })
                .eq("uuid", userId);

            if (error) {
                console.error("Error updating favorites:", error);
            } else {
                setFavsObj(newData);
            }

        } catch (error) {
            console.error('Error saving background:', error);
            setError('Failed to save background. Please try again.');
        }
    }, [userId]);

    const debouncedSave = useCallback(debounce(toggleFavorite, 1000), [favsObj]);

    const updateFavorite = async () => {
        setFavorite((prev) => !prev);

        const updatedFavs = favorite
            ? favsObj.filter((fav) => fav.name !== schoolData.name) // Remove favorite
            : [...favsObj, schoolData]; // Add favorite

        setFavsObj(updatedFavs)
    };

    useEffect(() => {
        if (favsObj)
            debouncedSave(favsObj);
    }, [favsObj, debouncedSave])

    return (
        <button onClick={updateFavorite}>
            {favorite ? <FiHeart color="red" /> : <FiHeart />}
        </button>
    );
}
