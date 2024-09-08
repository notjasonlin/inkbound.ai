export interface PlayerStats {
  height: number;
  weight: number;
  position: string;
  clubTeam: string;
  clubLevel: string;
  teamRole: string;
  satAct: string;
  gpaScale: string;
  intendedMajor: string;
}

export interface FormField {
  label: string;
  name: keyof PlayerStats;
}
