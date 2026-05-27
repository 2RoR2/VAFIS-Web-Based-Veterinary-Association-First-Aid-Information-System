import { AlertCircle, Clock, Calendar, ChevronRight, Star, MessageSquare, Play } from 'lucide-react';
import { useState } from 'react';
import { EmergencyBanner } from '../components/emergency/EmergencyBanner';
import { useApiData } from '../hooks/useApiData';
import { apiPost } from '../services/api';
import { Guide } from '../types/content';

interface GuidePageProps {
  guideId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function GuidePage({ guideId, onNavigate }: GuidePageProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: guides, loading, error } = useApiData<Guide[]>('/guides', []);

  const guide = guides.find((g) => g.id === guideId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">Loading guide...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <p className="text-destructive">Unable to load guide. {error}</p>
            <button
              onClick={() => onNavigate('emergency')}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Guides
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground mb-4">Guide not found</p>
            <button
              onClick={() => onNavigate('emergency')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Guides
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const handleSubmitFeedback = () => {
    if (rating === 0 || !guide || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    apiPost('/feedback', {
      contentType: 'Guide',
      contentTitle: guide.title,
      rating,
      comment: feedback,
      submittedBy: 'Pet Owner',
    })
      .then(() => {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFeedback('');
      })
      .catch((err) => {
        setSubmitError(err instanceof Error ? err.message : 'Unable to submit feedback.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button onClick={() => onNavigate('home')} className="hover:text-primary">
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => onNavigate('emergency')} className="hover:text-primary">
              Emergency Guides
            </button>
            <ChevronRight className="w-4 h-4" />
            <span>{guide.title}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="mb-2">{guide.title}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {guide.species.map((species) => (
                  <span key={species} className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded">
                    {species}
                  </span>
                ))}
                <span className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded">{guide.category}</span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded flex items-center gap-2 flex-shrink-0 ${severityColors[guide.severity]}`}
            >
              <AlertCircle className="w-4 h-4" />
              {severityLabels[guide.severity]}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {guide.readTime}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Last reviewed: {guide.lastReviewed}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Reviewed by: {guide.reviewedBy}</p>
        </div>

        <div className="mb-6">
          <EmergencyBanner onFindVet={() => onNavigate('clinics')} />
        </div>

        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="prose max-w-none">
            <h2>Step-by-Step Instructions</h2>
            <div className="space-y-4">
              {guide.steps.map((step) => (
                <div key={step.number} className="bg-muted p-4 rounded-lg">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3>{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-0">{step.description}</p>
                      {step.details && step.details.length > 0 && (
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1 mb-0">
                          {step.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {guide.warnings && guide.warnings.length > 0 && (
              <div className="bg-warning/10 border border-warning rounded-lg p-4 mt-6">
                <h3 className="flex items-center gap-2 text-warning-foreground">
                  <AlertCircle className="w-5 h-5" />
                  Warning Signs
                </h3>
                <ul className="text-sm space-y-1 mb-0">
                  {guide.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {guide.relatedVideos && guide.relatedVideos.length > 0 && (
              <>
                <h2>Related Videos</h2>
                <div className="grid md:grid-cols-2 gap-4 not-prose">
                  {guide.relatedVideos.slice(0, 2).map((videoId) => (
                    <button
                      key={videoId}
                      onClick={() => onNavigate('videos')}
                      className="bg-muted p-4 rounded-lg hover:bg-muted/80 transition-colors text-left group"
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded mb-3 flex items-center justify-center relative overflow-hidden">
                        <span className="text-4xl">Video</span>
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <h4>Watch: First-Aid Video</h4>
                      <p className="text-sm text-muted-foreground">View demonstration video</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="mb-4">Was this guide helpful?</h3>
          <button
            onClick={() => onNavigate('feedback', { contentType: 'First-aid guide', contentTitle: guide.title })}
            className="mb-5 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Open Full Feedback Form
          </button>
          {submitted ? (
            <div className="bg-success/10 border border-success rounded-lg p-4 text-center">
              <p className="text-success">Thank you for your feedback!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-6 h-6 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
                    />
                  </button>
                ))}
                {rating > 0 && <span className="text-sm text-muted-foreground ml-2">({rating}/5)</span>}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feedback or suggest improvements..."
                className="w-full px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring mb-4"
                rows={4}
              />
              {submitError && (
                <p className="text-sm text-destructive mb-3">Unable to submit feedback. {submitError}</p>
              )}
              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0 || isSubmitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
