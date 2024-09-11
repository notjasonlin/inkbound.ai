'use client'; 

import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { createClient } from "@/utils/supabase/client";

interface FavoriteButtonProps {
    userId: string;
    allFavorites: any;
    schoolData: SchoolData;
}

export default function FavoriteButton({ userId, allFavorites, schoolData }: FavoriteButtonProps) {
    const [favsObj, setFavsObj] = useState<SchoolData[]>([]);
    const [favorite, setFavorite] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Parse allFavorites and check if the passed schoolData is in the array
        try {
            const favs: SchoolData[] = JSON.parse(allFavorites);
            setFavsObj(favs);

            const isFavorite = favs.some(
                (favSchool) => favSchool.name === schoolData.name
            );
            setFavorite(isFavorite);
        } catch (error) {
            console.error("Invalid JSON:", error);
        }
    }, [allFavorites, schoolData]);

    const toggleFavorite = async () => {
        setFavorite((prev) => !prev);

        const updatedFavs = favorite
            ? favsObj.filter((fav) => fav.name !== schoolData.name) // Remove favorite
            : [...favsObj, schoolData]; // Add favorite

        const { data, error } = await supabase
            .from("favorite_schools")
            .update({ data: updatedFavs })
            .eq("uuid", userId);

        if (error) {
            console.error("Error updating favorites:", error);
        } else {
            setFavsObj(updatedFavs);
        }
    };

    return (
        <button onClick={toggleFavorite}>
            {favorite ? <FiHeart color="red" /> : <FiHeart />}
        </button>
    );
}
