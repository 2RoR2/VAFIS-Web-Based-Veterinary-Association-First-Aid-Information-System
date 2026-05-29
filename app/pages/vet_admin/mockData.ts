export const SPECIES_OPTIONS = ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Hamsters', 'Guinea Pigs'];

export const CATEGORY_OPTIONS = [
  'Choking', 'Bleeding', 'Burns', 'Fractures', 'Poisoning',
  'Seizures', 'Heatstroke', 'CPR', 'Eye Injury', 'Wound Care',
];

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  revision_required: 'Revision Required',
  reviewed: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

export function getStatusClasses(status: string): string {
  switch (status) {
    case 'published':      return 'bg-success text-success-foreground';
    case 'reviewed':       return 'bg-success/20 text-success';
    case 'pending_review': return 'bg-warning/20 text-warning';
    case 'revision_required': return 'bg-destructive/20 text-destructive';
    case 'draft':          return 'bg-muted text-muted-foreground';
    case 'archived':       return 'bg-muted/80 text-muted-foreground';
    default:               return 'bg-muted text-muted-foreground';
  }
}

export const QUIZ_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

export function getQuizStatusClasses(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-success text-success-foreground';
    case 'scheduled':
      return 'bg-warning/20 text-warning';
    case 'draft':
      return 'bg-muted text-muted-foreground';
    case 'archived':
      return 'bg-muted/80 text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function getSeverityClasses(severity: string): string {
  switch (severity) {
    case 'high':   return 'bg-destructive/15 text-destructive';
    case 'medium': return 'bg-warning/20 text-warning';
    case 'low':    return 'bg-success/20 text-success';
    default:       return 'bg-muted text-muted-foreground';
  }
}
