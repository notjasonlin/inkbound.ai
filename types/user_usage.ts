export interface UserUsage {
  user_id: string;
  ai_calls_used: number;
  schools_sent: number;
  templates_used: number;
  reset_day: string; // ISO string of timestamp
} 