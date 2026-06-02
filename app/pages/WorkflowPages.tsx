import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bell,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Edit,
  FileText,
  History,
  MapPin,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Video,
  XCircle,
} from 'lucide-react';
import { GuideCard } from '../components/cards/GuideCard';
import { ClinicCard } from '../components/cards/ClinicCard';
import clinicImage from '../assets/clinic-location-care.png';
import { useApiData } from '../hooks/useApiData';
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api';
import { AuditLogItem, Clinic, FeedbackItem, Guide, NotificationItem, Quiz, QuizResultItem, Video as VideoItem } from '../types/content';

export interface PetProfile {
  id: string;
  name: string;
  species: string;
  age: string;
}

interface WorkflowPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const speciesOptions = ['Dogs', 'Cats', 'Rabbits', 'Hamsters', 'Guinea Pigs', 'Birds'];


// Pet owner landing page showing a quick emergency search, the primary pet profile, species-filtered guides, and quiz history.
export function PetOwnerDashboard({ onNavigate }: WorkflowPageProps) {
  const { data: guides, loading, error } = useApiData<Guide[]>('/guides', []);
  const { data: quizResults } = useApiData<QuizResultItem[]>('/quizzes/my-results', []);
  const { data: pets } = useApiData<PetProfile[]>('/pets', []);
  const primaryPet = pets[0];
  const speciesGuides = primaryPet
    ? guides.filter((guide) => guide.species.includes(primaryPet.species) || guide.species.includes('All')).slice(0, 3)
    : guides.slice(0, 3);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-primary mb-2">Pet owner workspace</p>
            <h1 className="mb-2">Pet Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage your pets, continue learning, and jump quickly into emergency help.</p>
          </div>
          <button onClick={() => onNavigate('pet-profile')} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Manage Pets
          </button>
        </div>
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load guides. {error}
          </div>
        )}
        {loading && !error && (
          <p className="mb-6 text-sm text-muted-foreground">Loading guides...</p>
        )}

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 mb-8">
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Quick Emergency Search</h2>
            <div className="grid md:grid-cols-[220px_1fr_auto] gap-3">
              <select className="px-4 py-2 border border-input rounded-md bg-input-background">
                {(primaryPet ? [primaryPet.species] : speciesOptions).map((species) => (
                  <option key={species}>{species}</option>
                ))}
              </select>
              <input className="px-4 py-2 border border-input rounded-md bg-input-background" placeholder="Example: choking, bleeding, poison" />
              <button onClick={() => onNavigate('search', { species: primaryPet?.species })} className="px-5 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors">
                Search
              </button>
            </div>
          </section>

          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-3">Pet Profile</h2>
            {primaryPet ? (
              <div>
                <div className="text-3xl mb-1">{primaryPet.name}</div>
                <p className="text-muted-foreground">{primaryPet.species} - {primaryPet.age} years old</p>
              </div>
            ) : (
              <p className="text-muted-foreground mb-4">No pet profile saved yet.</p>
            )}
            <button onClick={() => onNavigate('pet-profile')} className="mt-4 text-primary hover:underline">Open pet profiles</button>
          </section>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <h2 className="mb-4">Recent Guides</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {speciesGuides.map((guide) => (
                <GuideCard key={guide.id} title={guide.title} severity={guide.severity} readTime={guide.readTime} description={guide.description} onClick={() => onNavigate('guide', { guideId: guide.id })} />
              ))}
            </div>
          </section>
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Quiz History</h2>
            <div className="space-y-3 mb-5">
              {quizResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No quizzes taken yet. Start a quiz to track your progress!</p>
              ) : (
                quizResults.slice(0, 3).map((item) => (
                  <div key={item.id} className="border border-border rounded-lg p-3">
                    <div className="font-medium text-sm">{item.quizTitle ?? item.quizId}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.percentage}% — {item.passed ? 'Passed' : 'Retake Suggested'}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => onNavigate('quiz')} className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">Open quizzes</button>
            {quizResults.length > 0 && (
              <button onClick={() => onNavigate('pet-quiz-history')} className="w-full mt-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm text-primary">
                View full quiz history
              </button>
            )}
            <button onClick={() => onNavigate('clinics')} className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">Find clinic</button>
          </section>
        </div>
      </div>
    </div>
  );
}

// Displays the pet profile management page where users can add, edit, and delete saved pet records.
export function PetProfilePage({ onNavigate }: WorkflowPageProps) {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingPet = pets.find((pet) => pet.id === editingId);

  useEffect(() => {
    apiGet<PetProfile[]>('/pets')
      .then(setPets)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pets.'))
      .finally(() => setLoadingPets(false));
  }, []);

  // Creates a new pet or updates an existing one via the API, then refreshes the pet list and clears the form.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const species = String(fd.get('species') || 'Dogs');
    const age = String(fd.get('age') || '').trim();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const updated = await apiPut<PetProfile>(`/pets/${editingId}`, { name, species, age });
        setPets((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await apiPost<PetProfile>('/pets', { name, species, age });
        setPets((prev) => [...prev, created]);
      }
      setEditingId(null);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pet.');
    } finally {
      setSaving(false);
    }
  };

  // Deletes the pet with the given ID via the API and removes it from the local list.
  const handleDelete = async (petId: string) => {
    setError('');
    try {
      await apiDelete<{ message: string }>(`/pets/${petId}`);
      setPets((prev) => prev.filter((p) => p.id !== petId));
      if (editingId === petId) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pet.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Pet Profile</h1>
          <p className="text-muted-foreground">Add pets so emergency searches and species content can be filtered faster.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <form key={editingId ?? 'new'} onSubmit={handleSubmit} className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">{editingPet ? 'Edit Pet' : 'Add Pet'}</h2>
            <label className="block mb-4">
              Pet name
              <input name="name" defaultValue={editingPet?.name} className="mt-2" required />
            </label>
            <label className="block mb-4">
              Species
              <select name="species" defaultValue={editingPet?.species || 'Dogs'} className="mt-2">
                {speciesOptions.map((species) => <option key={species}>{species}</option>)}
              </select>
            </label>
            <label className="block mb-5">
              Age
              <input name="age" defaultValue={editingPet?.age} className="mt-2" placeholder="Example: 3" required />
            </label>
            <button type="submit" disabled={saving} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : editingPet ? 'Save Changes' : 'Save Pet'}
            </button>
            {editingId && (
              <button type="button" onClick={() => setEditingId(null)} className="w-full mt-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                Cancel Edit
              </button>
            )}
          </form>

          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Saved Pets</h2>
            {loadingPets ? (
              <p className="text-sm text-muted-foreground">Loading pets...</p>
            ) : (
              <div className="space-y-3">
                {pets.map((pet) => (
                  <div key={pet.id} className="border border-border rounded-lg p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3>{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">{pet.species} - {pet.age} years old</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(pet.id)} className="p-2 hover:bg-muted rounded-md" aria-label="Edit pet"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(pet.id)} className="p-2 hover:bg-muted rounded-md" aria-label="Delete pet"><Trash2 className="w-4 h-4 text-destructive" /></button>
                    </div>
                  </div>
                ))}
                {pets.length === 0 && <p className="text-muted-foreground">No pet profiles yet.</p>}
              </div>
            )}
            <button onClick={() => onNavigate('pet-dashboard')} className="mt-6 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">Back to dashboard</button>
          </section>
        </div>
      </div>
    </div>
  );
}

// Displays guides, videos, and quizzes filtered to a specific animal species.
export function SpeciesPage({ onNavigate, species = 'Dogs' }: WorkflowPageProps & { species?: string }) {
  const { data: guides, loading: guidesLoading, error: guidesError } = useApiData<Guide[]>('/guides', []);
  const { data: videos, loading: videosLoading, error: videosError } = useApiData<VideoItem[]>('/videos', []);
  const { data: quizzes, loading: quizzesLoading, error: quizzesError } = useApiData<Quiz[]>('/quizzes', []);
  const relatedGuides = guides.filter((guide) => guide.species.includes(species) || guide.species.includes('All'));
  const relatedVideos = videos.filter((video) => video.species === species || video.species === 'All Pets').slice(0, 6);
  const relatedQuizzes = quizzes.filter((quiz) => quiz.species === species || quiz.species === 'All Pets').slice(0, 4);
  const loadError = guidesError || videosError || quizzesError;
  const isLoading = guidesLoading || videosLoading || quizzesLoading;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm text-primary mb-2">Species information</p>
          <h1 className="mb-2">{species} First-Aid Resources</h1>
          <p className="text-muted-foreground">Guides, videos, and quizzes related to {species.toLowerCase()}.</p>
        </div>
        {loadError && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load species resources. {loadError}
          </div>
        )}
        {isLoading && !loadError && (
          <p className="mb-6 text-sm text-muted-foreground">Loading species resources...</p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {relatedGuides.slice(0, 6).map((guide) => (
            <GuideCard key={guide.id} title={guide.title} severity={guide.severity} readTime={guide.readTime} description={guide.description} onClick={() => onNavigate('guide', { guideId: guide.id })} />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Related Videos</h2>
            <div className="space-y-3">
              {relatedVideos.map((video) => (
                <button key={video.id} onClick={() => onNavigate('videos')} className="w-full text-left border border-border rounded-lg p-3 hover:border-primary transition-colors">
                  <div className="font-medium">{video.title}</div>
                  <div className="text-sm text-muted-foreground">{video.duration} - {video.category}</div>
                </button>
              ))}
            </div>
          </section>
          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Related Quizzes</h2>
            <div className="space-y-3">
              {relatedQuizzes.map((quiz) => (
                <button key={quiz.id} onClick={() => onNavigate('quiz')} className="w-full text-left border border-border rounded-lg p-3 hover:border-primary transition-colors">
                  <div className="font-medium">{quiz.title}</div>
                  <div className="text-sm text-muted-foreground">{quiz.questions.length} questions - {quiz.difficulty}</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Guide authoring page where admins can create, edit, save as draft, submit for review, publish, or unpublish guides.
export function ManageGuidePage({ onNavigate }: WorkflowPageProps) {
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: guides, loading, error } = useApiData<Guide[]>(`/guides/admin?t=${refreshKey}`, []);

  // Increments the refresh key to force useApiData to re-fetch the guide list.
  const refresh = () => setRefreshKey((k) => k + 1);

  // Reads form field values from the DOM and returns them as a plain object, or null if the form ref is not mounted.
  const readForm = () => {
    const f = formRef.current;
    if (!f) return null;
    const d = new FormData(f);
    return {
      title: String(d.get('title') || '').trim(),
      species: String(d.get('species') || 'Dogs'),
      severity: String(d.get('severity') || 'high'),
      instructions: String(d.get('instructions') || '').trim(),
    };
  };

  // Converts parsed form values into the guide API payload shape expected by the backend.
  const buildPayload = (parsed: NonNullable<ReturnType<typeof readForm>>) => ({
    title: parsed.title,
    species: [parsed.species],
    severity: parsed.severity,
    readTime: '5 min',
    description: parsed.instructions.slice(0, 500),
    category: 'Emergency',
    steps: parsed.instructions.split('\n').filter(Boolean).map((line, i) => ({ number: i + 1, title: `Step ${i + 1}`, description: line })),
    warnings: [],
    relatedVideos: selectedGuide?.relatedVideos ?? [],
    relatedGuides: selectedGuide?.relatedGuides ?? [],
  });

  // Saves the current form as a draft via POST (new) or PUT (existing) without changing the guide's workflow status.
  const handleSaveDraft = async () => {
    const parsed = readForm();
    if (!parsed?.title) { setActionError('Guide title is required.'); return; }
    setSaving(true); setActionError(''); setActionSuccess('');
    try {
      const saved = selectedGuide
        ? await apiPut<Guide>(`/guides/${selectedGuide.id}`, buildPayload(parsed))
        : await apiPost<Guide>('/guides', buildPayload(parsed));
      setSelectedGuide(saved);
      setActionSuccess(`"${saved.title}" saved as draft.`);
      refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save draft.');
    } finally { setSaving(false); }
  };

  // Saves the guide if not yet persisted, then calls the submit endpoint to advance its status to pending_review.
  const handleSubmitForReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError(''); setActionSuccess('');
    let guideId = selectedGuide?.id;

    if (!guideId) {
      const parsed = readForm();
      if (!parsed?.title) { setActionError('Guide title is required.'); return; }
      setSaving(true);
      try {
        const saved = await apiPost<Guide>('/guides', buildPayload(parsed));
        guideId = saved.id;
        setSelectedGuide(saved);
        refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to save guide.');
        setSaving(false); return;
      }
      setSaving(false);
    }

    setSubmitting(true);
    try {
      const updated = await apiPost<Guide>(`/guides/${guideId}/submit`, {});
      setSelectedGuide(updated);
      setActionSuccess(`"${updated.title}" submitted for review.`);
      refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit for review.');
    } finally { setSubmitting(false); }
  };

  // Publishes the selected guide so it becomes visible to pet owners.
  const handlePublish = async () => {
    if (!selectedGuide) return;
    setPublishing(true); setActionError(''); setActionSuccess('');
    try {
      const updated = await apiPost<Guide>(`/guides/${selectedGuide.id}/publish`, {});
      setSelectedGuide(updated);
      setActionSuccess(`"${updated.title}" is now published and visible to pet owners.`);
      refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to publish guide.');
    } finally { setPublishing(false); }
  };

  // Unpublishes the selected guide, hiding it from pet owners.
  const handleUnpublish = async () => {
    if (!selectedGuide) return;
    setPublishing(true); setActionError(''); setActionSuccess('');
    try {
      const updated = await apiPost<Guide>(`/guides/${selectedGuide.id}/unpublish`, {});
      setSelectedGuide(updated);
      setActionSuccess(`"${updated.title}" has been unpublished.`);
      refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to unpublish guide.');
    } finally { setPublishing(false); }
  };

  // Selects a guide from the list to load it into the editor and clears any existing status messages.
  const selectGuide = (guide: Guide) => { setSelectedGuide(guide); setActionError(''); setActionSuccess(''); };

  return (
    <ManagementShell title="Manage First-Aid Guide" description="Create, edit, and submit guides through the review workflow." onNavigate={onNavigate}>
      {(error || actionError) && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error ?? actionError}</div>
      )}
      {actionSuccess && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{actionSuccess}</div>
      )}
      {loading && !error && <p className="mb-6 text-sm text-muted-foreground">Loading guides...</p>}

      <form ref={formRef} key={selectedGuide?.id ?? 'new'} className="grid lg:grid-cols-[1fr_320px] gap-6" onSubmit={handleSubmitForReview}>
        <section className="bg-white rounded-lg border border-border p-6">
          <label className="block mb-4">Guide title<input name="title" className="mt-2" defaultValue={selectedGuide?.title ?? ''} required /></label>
          <label className="block mb-4">Species<select name="species" className="mt-2" defaultValue={selectedGuide?.species[0] ?? 'Dogs'}>{speciesOptions.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="block mb-4">Severity<select name="severity" className="mt-2" defaultValue={selectedGuide?.severity ?? 'high'}><option value="high">Seek Vet Now</option><option value="medium">Act Soon</option><option value="low">Monitor</option></select></label>
          <label className="block mb-4">Instructions<textarea name="instructions" rows={8} className="mt-2" defaultValue={selectedGuide?.steps.map((s) => s.description).join('\n') ?? ''} /></label>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={saving || !!selectedGuide?.status && !['draft', 'revision_required'].includes(selectedGuide.status)} onClick={handleSaveDraft} className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center gap-2 disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button type="submit" disabled={submitting || saving || (!!selectedGuide?.status && !['draft', 'revision_required'].includes(selectedGuide.status))} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
            {selectedGuide?.status === 'reviewed' && (
              <button type="button" disabled={publishing} onClick={handlePublish} className="px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 disabled:opacity-60 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />{publishing ? 'Publishing…' : 'Publish'}
              </button>
            )}
            {selectedGuide?.status === 'published' && (
              <button type="button" disabled={publishing} onClick={handleUnpublish} className="px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10 disabled:opacity-60 flex items-center gap-2">
                <XCircle className="w-4 h-4" />{publishing ? 'Unpublishing…' : 'Unpublish'}
              </button>
            )}
            {selectedGuide && (
              <button type="button" onClick={() => { setSelectedGuide(null); setActionError(''); setActionSuccess(''); }} className="px-4 py-2 border border-border rounded-md hover:bg-muted">
                <Plus className="w-4 h-4 inline mr-1" />New
              </button>
            )}
          </div>
        </section>
        <aside className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-3">Guide Status</h2>
          <div className="rounded-lg bg-secondary text-secondary-foreground px-3 py-2 mb-4 capitalize">
            {(selectedGuide?.status ?? 'new').replace(/_/g, ' ')}
          </div>
          <h3 className="mb-3">All Guides</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {guides.map((guide) => (
              <button key={guide.id} type="button" onClick={() => selectGuide(guide)}
                className={`w-full text-left text-sm border rounded p-2 transition-colors ${selectedGuide?.id === guide.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}`}>
                <div className="font-medium truncate">{guide.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{guide.status?.replace(/_/g, ' ')}</div>
              </button>
            ))}
          </div>
        </aside>
      </form>
    </ManagementShell>
  );
}

// Stub quiz management page for creating quiz questions, setting the correct answer, and publishing.
export function ManageQuizPage({ onNavigate }: WorkflowPageProps) {
  const [published, setPublished] = useState(false);

  return (
    <ManagementShell title="Manage Quiz" description="Create quiz questions, set correct answers, preview, and publish." onNavigate={onNavigate}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="bg-white rounded-lg border border-border p-6">
          <label className="block mb-4">Quiz title<input className="mt-2" defaultValue="Emergency Response Check" /></label>
          <label className="block mb-4">Question<input className="mt-2" defaultValue="What should you check first in an unconscious pet?" /></label>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {['Airway, breathing, circulation', 'Temperature only', 'Food intake', 'Tail position'].map((answer, index) => (
              <label key={answer} className="border border-border rounded-lg p-3">
                <input type="radio" name="correct" defaultChecked={index === 0} className="mr-2" />
                {answer}
              </label>
            ))}
          </div>
          <button onClick={() => setPublished(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Publish Quiz</button>
        </section>
        <aside className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-3">Preview</h2>
          <p className="text-sm text-muted-foreground mb-4">The correct answer is highlighted during review before publishing.</p>
          <div className={`rounded-lg px-3 py-2 ${published ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{published ? 'Published' : 'Draft Preview'}</div>
        </aside>
      </div>
    </ManagementShell>
  );
}

// Clinic management page showing a form to add/edit clinic details alongside a live preview of existing clinic cards.
export function ManageClinicPage({ onNavigate }: WorkflowPageProps) {
  const { data: clinics, loading, error } = useApiData<Clinic[]>('/clinics', []);

  return (
    <ManagementShell title="Manage Vet Clinic" description="Add, edit, delete clinic details, opening hours, and emergency labels." onNavigate={onNavigate}>
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Unable to load clinics. {error}
        </div>
      )}
      {loading && !error && (
        <p className="mb-6 text-sm text-muted-foreground">Loading clinics...</p>
      )}
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <form className="bg-white rounded-lg border border-border p-6">
          <label className="block mb-4">Clinic name<input className="mt-2" defaultValue="Kuching Emergency Veterinary Centre" /></label>
          <label className="block mb-4">Phone<input className="mt-2" defaultValue="+60 82-555 100" /></label>
          <label className="block mb-4">Opening hours<input className="mt-2" defaultValue="Open 24/7" /></label>
          <label className="flex items-center gap-2 mb-5"><input type="checkbox" defaultChecked />Emergency / 24-hour clinic</label>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Save Clinic</button>
        </form>
        <div className="grid md:grid-cols-2 gap-4">
          {clinics.slice(0, 4).map((clinic) => (
            <ClinicCard key={clinic.id} name={clinic.name} address={`${clinic.address}, ${clinic.city}`} phone={clinic.phone} hours={clinic.hours} distance={clinic.distance} isOpen={clinic.isOpen} isEmergency={clinic.isEmergency} imageSrc={clinicImage} directionsUrl="#" />
          ))}
        </div>
      </div>
    </ManagementShell>
  );
}

// Veterinary professional dashboard showing pending review counts and a list of guides awaiting clinical approval.
export function ProfessionalDashboard({ onNavigate }: WorkflowPageProps) {
  const { data: guides, loading, error } = useApiData<Guide[]>('/guides/admin', []);
  const pending = guides.filter((g) => g.status === 'pending_review');
  const revisionRequired = guides.filter((g) => g.status === 'revision_required');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm text-primary mb-2">Veterinary professional</p>
          <h1 className="mb-2">Review Dashboard</h1>
          <p className="text-muted-foreground">Review submitted guide content, approve medically safe content, or request revisions.</p>
        </div>
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load guides. {error}
          </div>
        )}
        {loading && !error && <p className="mb-6 text-sm text-muted-foreground">Loading guides...</p>}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Metric icon={ClipboardCheck} label="Pending Reviews" value={pending.length} />
          <Metric icon={CheckCircle} label="Published Guides" value={guides.filter((g) => g.status === 'published').length} />
          <Metric icon={AlertCircle} label="Revision Required" value={revisionRequired.length} />
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-4">Pending Review Guides</h2>
          {pending.length === 0 && !loading && (
            <p className="text-muted-foreground text-sm">No guides are currently pending review.</p>
          )}
          <div className="space-y-3">
            {pending.map((guide) => (
              <button key={guide.id} onClick={() => onNavigate('review-guide', { guideId: guide.id })} className="w-full text-left border border-border rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3>{guide.title}</h3>
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  </div>
                  <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded capitalize">
                    {guide.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Guide review page for veterinary professionals to read guide content, leave comments, and approve or request changes.
export function ReviewGuidePage({ onNavigate, guideId = '' }: WorkflowPageProps & { guideId?: string }) {
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [decision, setDecision] = useState<string | null>(null);
  const { data: guide, loading, error } = useApiData<Guide | null>(`/guides/${guideId}`, null);

  // Posts the review decision (approve or request_changes) with optional comments to the guide review endpoint.
  const submitReview = async (action: 'approve' | 'request_changes') => {
    if (action === 'request_changes' && !comments.trim()) {
      setActionError('Comments are required when requesting changes.');
      return;
    }
    setSubmitting(true); setActionError('');
    try {
      await apiPost(`/guides/${guideId}/review`, { action, comments: comments.trim() || undefined });
      setDecision(action === 'approve' ? 'Approved' : 'Changes Requested');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="mb-2">Review Guide</h1>
          <p className="text-muted-foreground">Check clinical accuracy, leave comments, then approve or request changes.</p>
        </div>
        {(error || actionError) && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error ?? actionError}</div>
        )}
        {loading && !error && <p className="mb-6 text-sm text-muted-foreground">Loading guide...</p>}
        {!guide && !loading && !error && (
          <div className="rounded-lg border border-border bg-white p-6">
            <p className="text-muted-foreground">Guide not found.</p>
            <button onClick={() => onNavigate('professional-dashboard')} className="mt-4 text-primary hover:underline">Back to review dashboard</button>
          </div>
        )}
        {guide && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <article className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2>{guide.title}</h2>
                <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded capitalize">{guide.status?.replace(/_/g, ' ')}</span>
              </div>
              <p className="text-muted-foreground mb-5">{guide.description}</p>
              <div className="space-y-3">
                {guide.steps.map((step) => (
                  <div key={step.number} className="border border-border rounded-lg p-4">
                    <h3>{step.number}. {step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </article>
            <aside className="bg-white rounded-lg border border-border p-6">
              <h2 className="mb-4">Review Decision</h2>
              {decision ? (
                <div className="rounded-lg bg-secondary p-3 text-secondary-foreground mb-4">Decision submitted: <strong>{decision}</strong></div>
              ) : (
                <>
                  <label className="block mb-4">
                    Review comments
                    <textarea rows={6} className="mt-2" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Add clinical notes or required corrections." />
                  </label>
                  <button disabled={submitting} onClick={() => submitReview('approve')} className="w-full mb-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60">
                    {submitting ? 'Submitting…' : 'Approve'}
                  </button>
                  <button disabled={submitting} onClick={() => submitReview('request_changes')} className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-60">
                    Request Changes
                  </button>
                </>
              )}
              <button onClick={() => onNavigate('professional-dashboard')} className="mt-4 text-primary hover:underline block">Back to review dashboard</button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

// Displays the notifications list page with all workflow alerts, revision messages, and approval status events.
export function NotificationsPage({ onNavigate }: WorkflowPageProps) {
  const { data: notifications, loading, error } = useApiData<NotificationItem[]>('/workflow/notifications', []);

  return (
    <SimpleListPage title="Notifications" description="Review alerts, revision messages, and approval status." onNavigate={onNavigate} icon={Bell}>
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Unable to load notifications. {error}
        </div>
      )}
      {loading && !error && (
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      )}
      {notifications.map((item) => (
        <div key={item.id} className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{item.audience}</p>
              <h3>{item.event}</h3>
              <p className="text-sm text-muted-foreground">{item.timestamp}</p>
            </div>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{item.status}</span>
          </div>
        </div>
      ))}
    </SimpleListPage>
  );
}

// Displays the audit log page listing content lifecycle actions such as guide submissions, reviews, and approvals.
export function AuditLogPage({ onNavigate }: WorkflowPageProps) {
  const { data: auditLogs, loading, error } = useApiData<AuditLogItem[]>('/workflow/audit-logs', []);

  return (
    <SimpleListPage title="Audit Log" description="Action history for content changes, review decisions, and approvals." onNavigate={onNavigate} icon={History}>
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Unable to load audit log. {error}
        </div>
      )}
      {loading && !error && (
        <p className="text-sm text-muted-foreground">Loading audit log...</p>
      )}
      {auditLogs.map((item) => (
        <div key={item.id} className="bg-white border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">{item.timestamp}</p>
          <h3>{item.action}</h3>
          <p className="text-sm text-muted-foreground">{item.actor} - {item.target}</p>
        </div>
      ))}
    </SimpleListPage>
  );
}

// Confirmation dialog page that prompts the user to confirm or cancel logging out.
export function LogoutPage({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <ShieldCheck className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="mb-3">Log out?</h1>
          <p className="text-muted-foreground mb-6">You will be return to homepage</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onCancel} className="px-5 py-2 border border-border rounded-md hover:bg-muted">Cancel</button>
            <button onClick={onConfirm} className="px-5 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Log out</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin workflow hub showing quick-access tool cards for guides, quizzes, clinics, notifications, audit log, and review queue, plus summary metrics.
export function AdminWorkflowDashboard({ onNavigate }: WorkflowPageProps) {
  const { data: guides, loading: guidesLoading, error: guidesError } = useApiData<Guide[]>('/guides/admin', []);
  const { data: videos, loading: videosLoading, error: videosError } = useApiData<VideoItem[]>('/videos', []);
  const { data: feedbackItems, loading: feedbackLoading, error: feedbackError } = useApiData<FeedbackItem[]>('/feedback', []);
  const loadError = guidesError || videosError || feedbackError;
  const isLoading = guidesLoading || videosLoading || feedbackLoading;
  const tools = [
    { title: 'Manage Guides', page: 'manage-guide', icon: FileText },
    { title: 'Manage Quizzes', page: 'manage-quiz', icon: BookOpen },
    { title: 'Manage Clinics', page: 'manage-clinic', icon: MapPin },
    { title: 'Notifications', page: 'notifications', icon: Bell },
    { title: 'Audit Log', page: 'audit-log', icon: History },
    { title: 'Review Queue', page: 'professional-dashboard', icon: Stethoscope },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Admin Workflow Dashboard</h1>
          <p className="text-muted-foreground">Choose a content management area and continue the publishing workflow.</p>
        </div>
        {loadError && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load workflow metrics. {loadError}
          </div>
        )}
        {isLoading && !loadError && (
          <p className="mb-6 text-sm text-muted-foreground">Loading workflow metrics...</p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button key={tool.page} onClick={() => onNavigate(tool.page)} className="bg-white border border-border rounded-lg p-5 text-left hover:border-primary hover:shadow-md transition-all">
                <Icon className="w-7 h-7 text-primary mb-4" />
                <h2>{tool.title}</h2>
              </button>
            );
          })}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Metric icon={FileText} label="Guides" value={guides.length} />
          <Metric icon={Video} label="Videos" value={videos.length} />
          <Metric icon={Search} label="Feedback Items" value={feedbackItems.length} />
        </div>
      </div>
    </div>
  );
}

// Shared page shell for management screens, providing a consistent header with a title, description, and back-to-admin button.
function ManagementShell({ title, description, onNavigate, children }: WorkflowPageProps & { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <button onClick={() => onNavigate('admin-workflow')} className="px-4 py-2 border border-border rounded-md hover:bg-muted">Back to admin tools</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Generic list page layout with an icon, title, description, scrollable content slot, and a back-to-dashboard button.
function SimpleListPage({ title, description, onNavigate, icon: Icon, children }: WorkflowPageProps & { title: string; description: string; icon: typeof Bell; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><Icon className="w-6 h-6" /></div>
          <div>
            <h1 className="mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="space-y-3">{children}</div>
        <button onClick={() => onNavigate('admin-workflow')} className="mt-6 px-4 py-2 border border-border rounded-md hover:bg-muted">Back to dashboard</button>
      </div>
    </div>
  );
}

// Renders a single stat card with an icon, numeric value, and label for use in dashboard metric grids.
function Metric({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-border p-5 flex items-center gap-4">
      <div className="w-11 h-11 bg-secondary text-primary rounded-lg flex items-center justify-center"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="text-2xl">{value}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
