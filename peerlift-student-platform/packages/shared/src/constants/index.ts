// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  NGO_COORDINATOR: 'NGO_COORDINATOR',
  TEACHER: 'TEACHER',
  MENTOR: 'MENTOR',
  STUDENT: 'STUDENT',
} as const;

// Organization Types
export const ORGANIZATION_TYPES = {
  NGO: 'NGO',
  SCHOOL: 'SCHOOL',
  GOVERNMENT: 'GOVERNMENT',
} as const;

// Financial Categories
export const TRANSACTION_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Personal Care',
  'Home',
  'Other',
] as const;

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// Learning Difficulty Levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;

// Session Status
export const SESSION_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

// API Constants
export const API_CONSTANTS = {
  PAGINATION_DEFAULT_PAGE: 1,
  PAGINATION_DEFAULT_PAGE_SIZE: 20,
  PAGINATION_MAX_PAGE_SIZE: 100,
} as const;

// JWT Constants
export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// Error Codes
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_RESET: 'Password reset successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  GOAL_MILESTONE: 'GOAL_MILESTONE',
  RISK_ALERT: 'RISK_ALERT',
  MENTORSHIP_SESSION: 'MENTORSHIP_SESSION',
  LEARNING_ACHIEVEMENT: 'LEARNING_ACHIEVEMENT',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_INSIGHTS: true,
  ENABLE_REAL_TIME_NOTIFICATIONS: true,
  ENABLE_MENTORSHIP: true,
  ENABLE_LEARNING_MODULES: true,
  ENABLE_ADMIN_ANALYTICS: true,
} as const;
