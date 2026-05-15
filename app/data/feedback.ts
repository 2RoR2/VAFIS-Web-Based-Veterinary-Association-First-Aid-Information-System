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

export const feedbackItems: FeedbackItem[] = [
  {
    id: 'fb-001',
    contentType: 'Guide',
    contentTitle: 'Choking Emergency',
    rating: 5,
    comment: 'The steps were clear and helped me understand what to do before calling the clinic.',
    submittedBy: 'Pet Owner',
    status: 'Reviewed',
    submittedAt: '2026-04-24 09:20'
  },
  {
    id: 'fb-002',
    contentType: 'Quiz',
    contentTitle: 'Dog First-Aid Basics',
    rating: 4,
    comment: 'Good explanations, but I would like more examples for poisoning scenarios.',
    submittedBy: 'Pet Owner',
    status: 'New',
    submittedAt: '2026-04-24 11:45'
  },
  {
    id: 'fb-003',
    contentType: 'Guide',
    contentTitle: 'Heatstroke Emergency',
    rating: 3,
    comment: 'The warning signs are useful, but the cooling instructions could be easier to scan.',
    submittedBy: 'Pet Owner',
    status: 'Action Needed',
    submittedAt: '2026-04-23 16:10'
  }
];
