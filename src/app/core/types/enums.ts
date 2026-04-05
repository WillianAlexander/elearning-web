// User roles
export enum UserRole {
  Colaborador = 'colaborador',
  Instructor = 'instructor',
  Admin = 'admin',
}

// Course status
export enum CourseStatus {
  Draft = 'draft',
  PendingReview = 'pending_review',
  Published = 'published',
  Archived = 'archived',
  Rejected = 'rejected',
}

// Difficulty level
export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

// Enrollment status
export enum EnrollmentStatus {
  Active = 'active',
  Completed = 'completed',
  Dropped = 'dropped',
  Expired = 'expired',
}

// Content block types
export enum ContentBlockType {
  Text = 'text',
  Video = 'video',
  Pdf = 'pdf',
  Image = 'image',
  Quiz = 'quiz',
  Code = 'code',
  Audio = 'audio',
  Embed = 'embed',
}
