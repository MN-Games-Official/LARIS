import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string().max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^a-zA-Z0-9]/),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

// ─── Question Schema ──────────────────────────────────────────────────────────

export const QuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['multiple_choice', 'short_answer', 'true_false']),
  text: z.string().min(1, 'Question text is required').max(1000),
  options: z.array(z.string().max(500)).optional(),
  correct_answer: z.union([z.number(), z.string(), z.boolean()]).optional(),
  max_score: z.number().min(1).max(100).default(10),
  grading_criteria: z.string().max(1000).optional(),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;

// ─── Application Schema ───────────────────────────────────────────────────────

export const ApplicationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  group_id: z.string().regex(/^\d+$/, 'Group ID must be numeric').min(1),
  target_role: z.string().min(1, 'Target role is required').max(100),
  pass_score: z.number().min(0).max(100).default(70),
  style: z
    .object({
      primary_color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
        .default('#ff4b6e'),
      secondary_color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
        .default('#1f2933'),
    })
    .optional(),
  questions: z.array(QuestionSchema).min(1, 'At least one question is required').max(50),
});

export type ApplicationInput = z.infer<typeof ApplicationSchema>;

// ─── Rank Entry Schema ────────────────────────────────────────────────────────

export const RankEntrySchema = z.object({
  id: z.string().optional(),
  rank_id: z.number().min(0).max(255),
  gamepass_id: z.number().min(0).optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0).default(0),
  is_for_sale: z.boolean().default(false),
  regional_pricing: z.boolean().default(false),
});

export type RankEntryInput = z.infer<typeof RankEntrySchema>;

// ─── Rank Center Schema ───────────────────────────────────────────────────────

export const RankCenterSchema = z.object({
  name: z.string().min(3).max(100),
  group_id: z.string().regex(/^\d+$/, 'Group ID must be numeric'),
  universe_id: z
    .string()
    .regex(/^\d+$/, 'Universe ID must be numeric')
    .optional()
    .or(z.literal('')),
  ranks: z.array(RankEntrySchema).min(1, 'At least one rank is required').max(255),
});

export type RankCenterInput = z.infer<typeof RankCenterSchema>;

// ─── Profile Schema ───────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
});

// ─── API Key Schemas ──────────────────────────────────────────────────────────

export const RobloxApiKeySchema = z.object({
  api_key: z.string().min(10, 'API key is too short').max(500),
  validate: z.boolean().default(true),
});

export const PolarisApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expires_in: z.number().optional(), // seconds
});

// ─── AI Generation Schema ─────────────────────────────────────────────────────

export const AIGenerationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  group_id: z.string().min(1),
  rank: z.string().min(1),
  questions_count: z.number().min(1).max(20).default(6),
  vibe: z.enum(['professional', 'casual', 'strict', 'friendly']).default('professional'),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  instructions: z.string().max(1000).optional(),
});

export type AIGenerationInput = z.infer<typeof AIGenerationSchema>;
