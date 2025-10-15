// User-related type definitions

export interface Goal {
  id: number;
  user_id: number;
  goal: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_id: number;
  is_admin: boolean;
  has_created_first_log: boolean;
  first_log_created_at: string | null;
  has_used_analyzer: boolean;
  first_analyzer_used_at: string | null;
  goal: Goal | null;
}

export interface FeatureStatus {
  has_created_first_log: boolean;
  first_log_created_at: string | null;
  has_used_analyzer: boolean;
  first_analyzer_used_at: string | null;
}
