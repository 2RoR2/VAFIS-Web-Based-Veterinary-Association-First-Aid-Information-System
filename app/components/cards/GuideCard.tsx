import { AlertCircle, Clock } from 'lucide-react';

interface GuideCardProps {
  title: string;
  severity: 'low' | 'medium' | 'high';
  readTime: string;
  description: string;
  onClick: () => void;
}

// Displays a first-aid guide card with severity badge, read time, and a click handler to open the full guide.
export function GuideCard({ title, severity, readTime, description, onClick }: GuideCardProps) {
  const severityColors = {
    low: 'bg-success text-success-foreground',
    medium: 'bg-warning text-warning-foreground',
    high: 'bg-destructive text-destructive-foreground',
  };

  const severityLabels = {
    low: 'Monitor',
    medium: 'Act Soon',
    high: 'Seek Vet Now',
  };

  return (
    <button
      onClick={onClick}
      className="bg-white p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all text-left w-full group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="group-hover:text-primary transition-colors flex-1">{title}</h3>
        <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${severityColors[severity]}`}>
          <AlertCircle className="w-3 h-3" />
          {severityLabels[severity]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        {readTime}
      </div>
    </button>
  );
}
