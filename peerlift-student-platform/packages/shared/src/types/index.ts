// User and Authentication Types
export type UserRole = 'ADMIN' | 'NGO_COORDINATOR' | 'TEACHER' | 'MENTOR' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId: string | null;
  organizationId: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  type: 'NGO' | 'SCHOOL' | 'GOVERNMENT';
  createdAt: Date;
}

export interface School {
  id: string;
  organizationId: string;
  name: string;
  district: string;
  state: string;
  createdAt: Date;
}

// Financial Types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

// AI & Insights Types
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FinancialInsight {
  id: string;
  userId: string;
  insight: string;
  riskLevel: RiskLevel;
  aiModel: string;
  generatedAt: Date;
}

// Learning Types
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedTime: number; // in minutes
  createdAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
  createdAt: Date;
}

// Mentorship Types
export interface MentorshipSession {
  id: string;
  mentorId: string;
  studentId: string;
  topic: string;
  notes?: string;
  sessionDate: Date;
  feedback?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
