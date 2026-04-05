// User model
export interface User {
  id: string;
  cedula?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  area?: string;
  cargo?: string;
  isActive: boolean;
  lastLoginAt?: string;
  azureAdId?: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

// Course model
export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  estimatedDuration?: number;
  difficultyLevel?: string;
  status: string;
  categoryId?: string;
  createdById: string;
  publishedAt?: string;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Enrollment model
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt: string;
  completedAt?: string;
  droppedAt?: string;
  progressPercentage: number;
  verificationCode?: string;
  createdAt: string;
}

// Lesson model
export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  estimatedDuration?: number;
  isFree: boolean;
}

// Content block model
export interface ContentBlock {
  id: string;
  lessonId: string;
  type: string;
  content: any;
  order: number;
}
