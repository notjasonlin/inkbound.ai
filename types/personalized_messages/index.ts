export interface PersonalizedMessage {
    id: string;
    user_id: string;
    school_id: string;
    school_name: string;
    message: string | null;
    is_super_fav: boolean;
    is_curr_fav: boolean;
    is_generated: boolean;
    needs_handwritten: boolean;
}