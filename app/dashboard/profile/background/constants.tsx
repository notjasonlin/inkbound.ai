import { PlayerStats, FormField } from '@/types/background/index';

export const initialFormData: PlayerStats = {
  height: 0,
  weight: 0,
  position: '',
  clubTeam: '',
  clubLevel: '',
  teamRole: '',
  satAct: '',
  gpaScale: '',
  intendedMajor: '',
};

export const formFields: FormField[] = [
  { label: 'Height:', name: 'height' },
  { label: 'Weight:', name: 'weight' },
  { label: 'Position:', name: 'position' },
  { label: 'Club Team:', name: 'clubTeam' },
  { label: 'Club Level:', name: 'clubLevel' },
  { label: 'Role on the Team:', name: 'teamRole' },
  { label: 'SAT/ACT:', name: 'satAct' },
  { label: 'GPA / Scale:', name: 'gpaScale' },
  { label: 'Intended Major:', name: 'intendedMajor' },
];
