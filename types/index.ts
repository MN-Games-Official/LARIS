// ─── Global Types for Polaris Pilot ──────────────────────────────────────────

// ─── Question Types ───────────────────────────────────────────────────────────

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correct_answer?: number | string | boolean;
  max_score: number;
  grading_criteria?: string;
}

// ─── Application Types ────────────────────────────────────────────────────────

export interface ApplicationStyle {
  primary_color: string;
  secondary_color: string;
}

export interface Application {
  id: string;
  user_id: number;
  name: string;
  description?: string;
  group_id: string;
  target_role: string;
  pass_score: number;
  is_active: boolean;
  style: ApplicationStyle;
  questions: Question[];
  created_at: string;
  updated_at: string;
  submission_count?: number;
  pass_count?: number;
}

export interface ApplicationListItem {
  id: string;
  name: string;
  description?: string;
  group_id: string;
  target_role: string;
  pass_score: number;
  is_active: boolean;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
  submission_count: number;
  pass_count: number;
}

// ─── Rank Center Types ────────────────────────────────────────────────────────

export interface RankEntry {
  id: string;
  rank_id: number;
  gamepass_id?: number;
  name: string;
  description?: string;
  price: number;
  is_for_sale: boolean;
  regional_pricing: boolean;
}

export interface RankCenter {
  id: string;
  user_id: number;
  name: string;
  group_id: string;
  universe_id?: string;
  ranks: RankEntry[];
  created_at: string;
  updated_at: string;
}

export interface RankCenterListItem {
  id: string;
  name: string;
  group_id: string;
  universe_id?: string;
  rank_count: number;
  created_at: string;
  updated_at: string;
}

// ─── API Key Types ────────────────────────────────────────────────────────────

export type ApiKeyType = 'roblox' | 'polaris';

export interface ApiKey {
  id: number;
  type: ApiKeyType;
  name?: string;
  key_prefix: string;
  scopes?: string[];
  last_used?: string;
  expires_at?: string;
  created_at: string;
  is_active: boolean;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  email_verified: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  userId: number;
  email: string;
  username: string;
}

// ─── Submission Types ─────────────────────────────────────────────────────────

export type SubmissionStatus = 'pending' | 'success' | 'failed';

export interface ApplicationSubmission {
  id: string;
  application_id: string;
  roblox_user_id: string;
  membership_id?: string;
  answers: Record<string, string | number | boolean>;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  feedback?: string;
  promotion_status?: SubmissionStatus;
  submitted_at: string;
}

export interface GradingBreakdown {
  [questionId: string]: {
    type: QuestionType;
    score: number;
    max_score: number;
    feedback: string;
  };
}

export interface GradingResult {
  passed: boolean;
  total_score: number;
  max_score: number;
  percentage: number;
  breakdown: GradingBreakdown;
  promotion?: {
    success: boolean;
    group_id: string;
    rank_id?: number;
    message: string;
  };
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total_applications: number;
  total_submissions: number;
  total_pass: number;
  pass_rate: number;
  total_rank_centers: number;
  roblox_key_active: boolean;
  polaris_keys_count: number;
}

// ─── Roblox Types ─────────────────────────────────────────────────────────────

export interface RobloxRole {
  id: number;
  name: string;
  rank: number;
  memberCount: number;
}
