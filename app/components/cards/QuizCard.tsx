import { Brain, CheckCircle } from 'lucide-react';

interface QuizCardProps {
  title: string;
  questions: number;
  species: string;
  completed?: boolean;
  score?: number;
  onClick: () => void;
}

// Displays a quiz card with title, question count, species, and optional completion score.
export function QuizCard({ title, questions, species, completed, score, onClick }: QuizCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-5 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all text-left w-full group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {questions} questions - {species}
          </p>
          {completed && score !== undefined && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              Completed: {score}%
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
