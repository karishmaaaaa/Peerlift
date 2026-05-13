import { z } from 'zod';

// Auth Validators
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['STUDENT', 'MENTOR', 'TEACHER', 'NGO_COORDINATOR', 'ADMIN']),
  organizationId: z.string().uuid('Invalid organization ID'),
  schoolId: z.string().uuid('Invalid school ID').optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// User Validators
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// Transaction Validators
export const CreateTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.date().or(z.string().datetime()),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

// Savings Goal Validators
export const CreateGoalSchema = z.object({
  goalName: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.date().or(z.string().datetime()),
});

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;

export const UpdateGoalSchema = z.object({
  goalName: z.string().min(1, 'Goal name is required').optional(),
  targetAmount: z.number().positive('Target amount must be positive').optional(),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').optional(),
  deadline: z.date().or(z.string().datetime()).optional(),
});

export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;

// Learning Module Validators
export const CreateLearningModuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedTime: z.number().positive('Estimated time must be positive'),
});

export type CreateLearningModuleInput = z.infer<typeof CreateLearningModuleSchema>;

// Mentorship Validators
export const CreateMentorshipSessionSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  topic: z.string().min(1, 'Topic is required'),
  sessionDate: z.date().or(z.string().datetime()),
  notes: z.string().optional(),
});

export type CreateMentorshipSessionInput = z.infer<typeof CreateMentorshipSessionSchema>;

export const UpdateMentorshipSessionSchema = z.object({
  feedback: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateMentorshipSessionInput = z.infer<typeof UpdateMentorshipSessionSchema>;

// Pagination Validator
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
