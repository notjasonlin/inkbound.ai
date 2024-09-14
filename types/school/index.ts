export interface CoachData {
    name: string;
    email: string;
    position: string;
}

export interface SchoolData {
    id: string;
    name: string;
    coaches: CoachData[];
    division: string;
    state: string;
    conference: string;
}
