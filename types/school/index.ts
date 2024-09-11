interface CoachData {
    name: string;
    email: string;
    position: string;
}

interface SchoolData {
    name: string;
    coaches: CoachData[];
    division: string;
    state: string;
    conference: string;
}
