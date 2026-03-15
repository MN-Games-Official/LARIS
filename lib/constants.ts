// ─── App Constants ────────────────────────────────────────────────────────────

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Polaris Pilot';
export const APP_DESCRIPTION = 'Admin portal for the Polaris Pilot system';
export const APP_VERSION = '1.0.0';

// ─── API Routes ───────────────────────────────────────────────────────────────

export const API_ROUTES = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh-token',
  AUTH_VERIFY_EMAIL: '/api/auth/verify-email',

  // Password
  PASSWORD_REQUEST_RESET: '/api/password/request-reset',
  PASSWORD_RESET: '/api/password/reset',

  // Applications
  APPLICATIONS: '/api/applications',
  APPLICATION: (id: string) => `/api/applications/${id}`,
  APPLICATION_GENERATE: (id: string) => `/api/applications/${id}/generate`,
  APPLICATION_IMPORT: (id: string) => `/api/applications/${id}/import`,

  // Rank Centers
  RANK_CENTERS: '/api/rank-centers',
  RANK_CENTER: (id: string) => `/api/rank-centers/${id}`,

  // API Keys
  API_KEYS_ROBLOX: '/api/api-keys/roblox',
  API_KEYS_ROBLOX_VALIDATE: '/api/api-keys/roblox/validate',
  API_KEYS_POLARIS: '/api/api-keys/polaris',
  API_KEYS_POLARIS_REGENERATE: '/api/api-keys/polaris/regenerate',

  // Users
  USER_PROFILE: '/api/users/profile',
  USER_CHANGE_PASSWORD: '/api/users/change-password',
} as const;

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  {
    label: 'Application Center',
    href: '/dashboard/application-center',
    icon: 'FileText',
  },
  {
    label: 'Rank Center',
    href: '/dashboard/rank-center',
    icon: 'Star',
  },
  {
    label: 'API Keys',
    href: '/dashboard/api-keys',
    icon: 'Key',
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: 'User',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'Settings',
  },
] as const;

// ─── Vibes ────────────────────────────────────────────────────────────────────

export const FORM_VIBES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'strict', label: 'Strict' },
  { value: 'friendly', label: 'Friendly' },
] as const;

// ─── Polaris API Scopes ───────────────────────────────────────────────────────

export const POLARIS_SCOPES = [
  { value: 'applications:read', label: 'Applications', description: 'Read application forms' },
  { value: 'applications:write', label: 'Applications (Write)', description: 'Create & edit forms' },
  { value: 'submissions:read', label: 'Submissions', description: 'Read submission data' },
  { value: 'rank-centers:read', label: 'Rank Centers', description: 'Read rank center config' },
  { value: 'rank-centers:write', label: 'Rank Centers (Write)', description: 'Edit rank centers' },
  { value: 'webhooks:receive', label: 'Webhooks', description: 'Receive webhook events' },
];

// ─── Status Badges ────────────────────────────────────────────────────────────

export const SUBMISSION_STATUSES = ['pending', 'success', 'failed'] as const;

export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'true_false', label: 'True / False' },
] as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_SHORT_ANSWER_QUESTIONS = 3;
export const MAX_QUESTIONS_PER_APPLICATION = 50;

// ─── Colors ───────────────────────────────────────────────────────────────────

export const DEFAULT_PRIMARY_COLOR = '#ff4b6e';
export const DEFAULT_SECONDARY_COLOR = '#1f2933';

export const PRESET_COLORS = [
  '#ff4b6e',
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#f97316',
  '#14b8a6',
] as const;
