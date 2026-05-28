export interface GuideStep {
  number: number;
  title: string;
  description: string;
  details?: string[];
  image?: string;
}

export type GuideStatus = 'draft' | 'pending_review' | 'reviewed' | 'published' | 'revision_required' | 'archived';

export interface Guide {
  id: string;
  title: string;
  species: string[];
  severity: 'low' | 'medium' | 'high';
  readTime: string;
  description: string;
  category: string;
  lastReviewed: string;
  reviewedBy: string;
  steps: GuideStep[];
  warnings: string[];
  relatedVideos: string[];
  relatedGuides: string[];
  // workflow fields
  status?: GuideStatus;
  createdBy?: string | null;
  assignedVetId?: string | null;
  reviewComments?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export interface Video {
  id: string;
  title: string;
  duration: string;
  species: string;
  category: string;
  description: string;
  thumbnail: string;
  instructor: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  views: number;
  videoUrl?: string | null;
  relatedGuideId?: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  species: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  passingScore: number;
  questions: QuizQuestion[];
  description: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  hours: string;
  hoursDetail: Record<string, string>;
  distance: string;
  isOpen: boolean;
  isEmergency: boolean;
  services: string[];
  species: string[];
  rating: number;
  reviews: number;
  lat?: number;
  lng?: number;
  /** Returned by GET /clinics/nearby — actual computed distance from user's GPS position */
  distanceKm?: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
  available: string;
}

export interface FeedbackItem {
  id: string;
  contentType: 'Guide' | 'Quiz' | 'Video' | 'Clinic Directory';
  contentTitle: string;
  rating: number;
  comment: string;
  submittedBy: string;
  status: 'New' | 'Reviewed' | 'Action Needed';
  submittedAt: string;
}

export interface NotificationItem {
  id: string;
  audience: string;
  event: string;
  status: string;
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface QuizResultItem {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  attemptDate: string;
  quizTitle?: string;
}
