import { SchoolData } from "../school";

export interface FavoriteSchoolsData {
    id?: string;
    schools: SchoolData[];
    super_favorites: string[];
}

