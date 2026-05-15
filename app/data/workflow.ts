export interface ActorRequirement {
  id: string;
  name: string;
  role: string;
  summary: string;
  responsibilities: string[];
  systemRequirements: string[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  actor: string;
  description: string;
  output: string;
}

export interface SystemSupportItem {
  id: string;
  title: string;
  description: string;
  examples: string[];
}

export const actorRequirements: ActorRequirement[] = [
  {
    id: 'pet-owner',
    name: 'Pet Owner',
    role: 'Primary Actor',
    summary: 'Main public user who accesses emergency guidance, learning resources, clinics, quizzes, and feedback without needing to log in during urgent situations.',
    responsibilities: [
      'Search for first-aid guidance based on species and emergency scenario',
      'View step-by-step FirstAidGuide instructions',
      'Watch educational videos',
      'Complete quizzes and view results',
      'Locate nearby veterinary clinics',
      'Submit feedback on guides and quizzes'
    ],
    systemRequirements: [
      'Access public content without login for fast emergency response',
      'Receive clear, structured, and easy-to-follow guidance',
      'Complete key emergency tasks within minimal steps',
      'Use location-based clinic services',
      'Provide feedback for continuous improvement'
    ]
  },
  {
    id: 'veterinary-professional',
    name: 'Veterinary Professional',
    role: 'Domain Expert Actor',
    summary: 'Clinical reviewer who validates medical content before publication to keep the platform safe, accurate, and professionally reliable.',
    responsibilities: [
      'Review submitted first-aid guides',
      'Validate clinical accuracy of content',
      'Provide feedback or request revisions',
      'Approve or reject content for publication',
      'Optionally contribute educational content'
    ],
    systemRequirements: [
      'Receive notifications when guides are submitted for review',
      'Access a review dashboard listing pending guides',
      'Annotate and comment on guides',
      'Ensure only clinically accurate information is approved'
    ]
  },
  {
    id: 'administrator',
    name: 'Veterinary Association Administrator',
    role: 'System Controller Actor',
    summary: 'Internal controller responsible for content lifecycle, final approval, publishing, scheduling, user management, and operational oversight.',
    responsibilities: [
      'Create and update first-aid guides',
      'Submit guides for review',
      'Manage quiz content and questions',
      'Approve reviewed guides for publication',
      'Manage system users and content lifecycle'
    ],
    systemRequirements: [
      'Use secure access with authentication and MFA',
      'Manage content through an admin dashboard',
      'Publish, unpublish, and schedule content',
      'Maintain audit logs of system activities',
      'Ensure outdated content is reviewed'
    ]
  }
];

export const workflowSteps: WorkflowStep[] = [
  {
    id: 'emergency-start',
    title: 'Emergency response begins',
    actor: 'Pet Owner',
    description: 'The pet owner selects a pet species and identifies an emergency scenario under time pressure.',
    output: 'Species and scenario inputs are used to retrieve relevant guidance.'
  },
  {
    id: 'guide-retrieval',
    title: 'FirstAidGuide is retrieved',
    actor: 'System',
    description: 'The system retrieves a clinically reviewed guide with structured instructions, warnings, and multimedia support.',
    output: 'Step-by-step FirstAidGuide is displayed clearly to the pet owner.'
  },
  {
    id: 'continuous-learning',
    title: 'Continuous learning',
    actor: 'Pet Owner',
    description: 'The pet owner watches videos, completes quizzes, reviews results, and submits feedback to reinforce preparedness.',
    output: 'Learning progress and feedback improve future readiness and content quality.'
  },
  {
    id: 'content-authoring',
    title: 'Content creation and update',
    actor: 'Veterinary Association Administrator',
    description: 'The administrator creates or updates first-aid guides, quiz questions, and learning content.',
    output: 'Draft content is submitted into the clinical review workflow.'
  },
  {
    id: 'clinical-review',
    title: 'Clinical validation',
    actor: 'Veterinary Professional',
    description: 'The veterinary professional reviews content for medical accuracy, adds comments, and approves or requests revision.',
    output: 'Reviewed content becomes ready for final administrative approval or revision.'
  },
  {
    id: 'final-approval',
    title: 'Final approval and publication',
    actor: 'Veterinary Association Administrator',
    description: 'The administrator performs final sign-off, publishes or schedules content, and ensures audit records are stored.',
    output: 'Clinically validated content becomes available to pet owners.'
  }
];

export const systemSupportItems: SystemSupportItem[] = [
  {
    id: 'notifications',
    title: 'Notification',
    description: 'Notifications inform relevant actors when content is submitted, review is requested, revision is required, or approval is complete.',
    examples: [
      'Veterinary Professional receives a pending review alert',
      'Administrator receives a revision-required alert',
      'Administrator is notified when content has not been reviewed within 12 months'
    ]
  },
  {
    id: 'audit-log',
    title: 'AuditLog',
    description: 'Audit logs maintain a secure record of critical actions across content creation, review, approval, publication, and user access.',
    examples: [
      'Guide created or edited by administrator',
      'Clinical review outcome submitted by veterinary professional',
      'Final approval and publication timestamp recorded'
    ]
  }
];

export const workflowOutcomes = [
  'Fast access to emergency information',
  'Continuous learning for pet owners',
  'Strict validation and approval of medical content',
  'Clear separation of responsibilities between system actors'
];

export const notifications = [
  {
    id: 'n-001',
    audience: 'Veterinary Professional',
    event: 'Guide submitted for clinical review',
    status: 'Pending',
    timestamp: 'Today, 09:15'
  },
  {
    id: 'n-002',
    audience: 'Veterinary Association Administrator',
    event: 'Revision required on bleeding wound guide',
    status: 'Action Required',
    timestamp: 'Today, 10:40'
  },
  {
    id: 'n-003',
    audience: 'Veterinary Association Administrator',
    event: 'Annual review due for heatstroke guide',
    status: 'Review Due',
    timestamp: 'Yesterday, 16:05'
  }
];

export const auditLogs = [
  {
    id: 'a-001',
    actor: 'Administrator',
    action: 'Created guide draft',
    target: 'Rabbit Heatstroke Guide',
    timestamp: '2026-04-21 09:03'
  },
  {
    id: 'a-002',
    actor: 'Veterinary Professional',
    action: 'Requested revision',
    target: 'Bleeding Wound Guide',
    timestamp: '2026-04-22 14:18'
  },
  {
    id: 'a-003',
    actor: 'Administrator',
    action: 'Published reviewed content',
    target: 'Safe Emergency Transport',
    timestamp: '2026-04-23 11:36'
  }
];
