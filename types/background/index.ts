export interface PlayerStats {
  satScore: number;
  actScore: number;
  unweightedGpa: number;
  intendedMajor: string;
  preferredStudentBodySize: string[];
  homeState: string;
  preferHomeStateSchool: string;
  financialAidQualification: string;
}

export interface FormField {
  label: string;
  name: keyof PlayerStats;
  type?: 'text' | 'number' | 'dropdown';
  options?: string[];
}
