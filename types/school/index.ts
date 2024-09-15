export interface CoachData {
    name: string;
    email: string;
    position: string;
}

export interface SchoolData {
    id: string;
    school: string;
    coaches: CoachData[];
    division: string;
    state: string;
    conference: string;
}
