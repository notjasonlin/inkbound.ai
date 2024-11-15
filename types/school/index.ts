export interface CoachData {
    name: string;
    email: string;
    position: string;
}

export interface BioData {
    undergraduates: string | null,
    early_action: string | null,
    early_decision: string | null,
    reg_admission_deadline: string | null,
    sat_math: string | null,
    sat_ebrw: string | null,
    sat: string | null,
    act: string | null,
    cost: string | null,
    need_met: string | null,
    academic_calendar: string | null,
    gen_ed_req: string | null,
    nearest_metro: string | null,
    freshman_housing: string | null,
    gpa: string | null,

}

export interface SchoolData {
    id: string;
    school: string;
    coaches: CoachData[];
    division: string;
    state: string;
    conference: string;
    biography: BioData | null;
}
