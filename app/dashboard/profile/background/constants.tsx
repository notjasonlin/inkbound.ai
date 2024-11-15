// constants.ts

export interface PlayerStats {
  satScore: number;
  actScore: number;
  unweightedGpa: number;
  intendedMajor: string;
  preferredStudentBodySize: string[]; // Store as an array for multiple selection
  homeState: string;
  preferHomeStateSchool: string;
  financialAidQualification: string;
}

export interface FormField {
  label: string;
  name: keyof PlayerStats;
  type?: 'text' | 'number' | 'dropdown'; // Exclude "checkbox" here
  options?: string[];
}

export const initialFormData: PlayerStats = {
  satScore: 0,
  actScore: 0,
  unweightedGpa: 0,
  intendedMajor: '',
  preferredStudentBodySize: [],
  homeState: '',
  preferHomeStateSchool: '',
  financialAidQualification: '',
};

// Define fields, excluding any "checkbox" types for `InputField`.
export const formFields: FormField[] = [
  {
    label: 'SAT Score',
    name: 'satScore',
    type: 'number',
  },
  {
    label: 'ACT Score',
    name: 'actScore',
    type: 'number',
  },
  {
    label: 'Current Unweighted GPA',
    name: 'unweightedGpa',
    type: 'number',
  },
  {
    label: 'Intended Major',
    name: 'intendedMajor',
    type: 'dropdown',
    options: [
      'Business', 'Nursing', 'Psychology', 'Biology', 'Education', 'Accounting and Finance', 
      'Engineering', 'Communications', 'Computer Science', 'Political Science', 
      'Economics', 'Kinesiology and Physical Therapy', 'English', 'Criminal Justice', 
      'Anthropology and Sociology', 'Architecture', 'Environmental Science', 
      'History', 'Mathematics', 'Agricultural Sciences', 'Religious Studies', 
      'Performing Arts', 'Chemistry', 'Physics', 'Philosophy', 'Sports Management', 
      'Art', 'Music', 'Information Technology'
    ],
  },
  {
    label: 'What size of student body do you prefer?',
    name: 'preferredStudentBodySize',
    options: [
      'Small: Less than 5,000 Students',
      'Medium: 5,000 to 12,500 students',
      'Large: 12,500 to 25,000 students',
      'Very Large: Over 25,000 students',
    ],
  },
  {
    label: 'What is your home state?',
    name: 'homeState',
    type: 'dropdown',
    options: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
      'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 
      'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 
      'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
      'West Virginia', 'Wisconsin', 'Wyoming'
    ],
  },
  {
    label: 'Do you prefer to attend a school in your home state?',
    name: 'preferHomeStateSchool',
    type: 'dropdown',
    options: ['Yes', 'No'],
  },
  {
    label: 'Do you qualify for financial aid?',
    name: 'financialAidQualification',
    type: 'dropdown',
    options: ['Yes', 'Most Likely', 'Maybe', 'Probably Not'],
  }
];
