export interface GuideStep {
  number: number;
  title: string;
  description: string;
  details?: string[];
  image?: string;
}

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
