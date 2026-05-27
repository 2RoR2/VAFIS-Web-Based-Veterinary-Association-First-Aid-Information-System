import { CheckCircle, MessageSquare, Send, Star } from 'lucide-react';
import { FormEvent, useState } from 'react';
import videoTutorialImage from '../assets/video_tutorial.jpg';
import { apiPost } from '../services/api';
import { FeedbackItem } from '../types/content';

interface FeedbackPageProps {
  onNavigate: (page: string, data?: any) => void;
  contentType?: string;
  contentTitle?: string;
}

const contentTypes = ['First-aid guide', 'Quiz', 'Video', 'Clinic directory'];
const contentTypeMap: Record<string, FeedbackItem['contentType']> = {
  'First-aid guide': 'Guide',
  'Clinic directory': 'Clinic Directory',
  Quiz: 'Quiz',
  Video: 'Video',
  Guide: 'Guide',
  'Clinic Directory': 'Clinic Directory',
};

export function FeedbackPage({ onNavigate, contentType = 'First-aid guide', contentTitle = '' }: FeedbackPageProps) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rating === 0 || isSubmitting) {
      setSubmitError('Please select a rating before submitting.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const selectedType = String(form.get('contentType') || contentType);
    const payload = {
      contentType: contentTypeMap[selectedType] ?? 'Guide',
      contentTitle: String(form.get('contentTitle') || contentTitle),
      rating,
      comment: String(form.get('comment') || ''),
      submittedBy: 'Pet Owner',
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiPost('/feedback', payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
          <section className="paw-card bg-gradient-to-br from-secondary via-white to-accent/40 rounded-3xl border border-border p-8">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="text-sm text-primary mb-2">Pet owner feedback</p>
            <h1 className="text-4xl mb-4">Help improve VAFIS content</h1>
            <p className="text-muted-foreground mb-6">
              Rate guides, quizzes, videos, or clinic directory information so the Veterinary Association can identify unclear, outdated, or especially helpful content.
            </p>
            <img
              src={videoTutorialImage}
              alt="Pet owner reviewing veterinary first-aid learning content"
              className="w-full aspect-video object-cover rounded-2xl border border-border"
            />
          </section>

          <section className="bg-white rounded-3xl border border-border p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-success/10 rounded-full mx-auto mb-5 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="mb-3">Thank you for your feedback</h2>
                <p className="text-muted-foreground mb-6">
                  Your response has been recorded for content quality review.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => onNavigate('home')} className="px-5 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    Back Home
                  </button>
                  <button onClick={() => onNavigate('emergency')} className="px-5 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                    Browse Guides
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h2 className="mb-2">Submit feedback</h2>
                  <p className="text-sm text-muted-foreground">
                    A rating is required. Written comments are optional but help reviewers understand what to improve.
                  </p>
                </div>

                <label className="block mb-5">
                  Content type
                  <select name="contentType" defaultValue={contentType} className="mt-2 rounded-xl">
                    {contentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <label className="block mb-5">
                  Content title or topic
                  <input name="contentTitle" defaultValue={contentTitle} placeholder="Example: Choking Emergency" className="mt-2 rounded-xl" />
                </label>

                <fieldset className="mb-5">
                  <legend className="mb-3">Rating</legend>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                      </button>
                    ))}
                    {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5 selected</span>}
                  </div>
                  {rating === 0 && <p className="text-xs text-muted-foreground mt-2">Select a rating before submitting.</p>}
                </fieldset>

                <label className="block mb-6">
                  Comments
                  <textarea
                    name="comment"
                    rows={6}
                    placeholder="Tell us what was clear, confusing, missing, or helpful."
                    className="mt-2 rounded-xl"
                  />
                </label>

                <button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  className="w-full bg-primary text-primary-foreground rounded-2xl px-5 py-3 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                {submitError && (
                  <p className="mt-3 text-sm text-destructive">Unable to submit feedback. {submitError}</p>
                )}
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
