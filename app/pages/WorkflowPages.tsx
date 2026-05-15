import { FormEvent, useMemo, useState } from 'react';
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
import { guides } from '../data/guides';
import { quizzes } from '../data/quizzes';
import { videos } from '../data/videos';
import { clinics } from '../data/clinics';
import { auditLogs, notifications } from '../data/workflow';
import { feedbackItems } from '../data/feedback';
import clinicImage from '../assets/clinic-location-care.png';

export interface PetProfile {
  id: string;
  name: string;
  species: string;
  age: string;
}

interface WorkflowPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface PetWorkflowPageProps extends WorkflowPageProps {
  pets: PetProfile[];
  onPetsChange: (pets: PetProfile[]) => void;
}

const speciesOptions = ['Dogs', 'Cats', 'Rabbits', 'Hamsters', 'Guinea Pigs', 'Birds'];

const draftGuides = guides.slice(0, 4).map((guide, index) => ({
  ...guide,
  status: index === 0 ? 'Pending Review' : index === 1 ? 'Revision Required' : 'Published',
}));

export function PetOwnerDashboard({ onNavigate, pets }: PetWorkflowPageProps) {
  const primaryPet = pets[0];
  const speciesGuides = primaryPet
    ? guides.filter((guide) => guide.species.includes(primaryPet.species) || guide.species.includes('All')).slice(0, 3)
    : guides.slice(0, 3);

  const quizHistory = [
    { title: 'Dog First-Aid Basics', score: 80, status: 'Passed' },
    { title: 'General Pet First-Aid', score: 58, status: 'Retake Suggested' },
  ];

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
              {quizHistory.map((item) => (
                <div key={item.title} className="border border-border rounded-lg p-3">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.score}% - {item.status}</div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('quiz')} className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">Open quizzes</button>
            <button onClick={() => onNavigate('clinics')} className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">Find clinic</button>
          </section>
        </div>
      </div>
    </div>
  );
}

export function PetProfilePage({ onNavigate, pets, onPetsChange }: PetWorkflowPageProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingPet = pets.find((pet) => pet.id === editingId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextPet = {
      id: editingId || crypto.randomUUID(),
      name: String(form.get('name') || 'Unnamed Pet'),
      species: String(form.get('species') || 'Dogs'),
      age: String(form.get('age') || '1'),
    };

    onPetsChange(editingId ? pets.map((pet) => (pet.id === editingId ? nextPet : pet)) : [...pets, nextPet]);
    setEditingId(null);
    event.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Pet Profile</h1>
          <p className="text-muted-foreground">Add pets so emergency searches and species content can be filtered faster.</p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border p-6">
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
            <button type="submit" className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              {editingPet ? 'Save Changes' : 'Save Pet'}
            </button>
          </form>

          <section className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Saved Pets</h2>
            <div className="space-y-3">
              {pets.map((pet) => (
                <div key={pet.id} className="border border-border rounded-lg p-4 flex items-center justify-between gap-4">
                  <div>
                    <h3>{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">{pet.species} - {pet.age} years old</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(pet.id)} className="p-2 hover:bg-muted rounded-md" aria-label="Edit pet"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onPetsChange(pets.filter((item) => item.id !== pet.id))} className="p-2 hover:bg-muted rounded-md" aria-label="Delete pet"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
              ))}
              {pets.length === 0 && <p className="text-muted-foreground">No pet profiles yet.</p>}
            </div>
            <button onClick={() => onNavigate('pet-dashboard')} className="mt-6 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">Back to dashboard</button>
          </section>
        </div>
      </div>
    </div>
  );
}

export function SpeciesPage({ onNavigate, species = 'Dogs' }: WorkflowPageProps & { species?: string }) {
  const relatedGuides = guides.filter((guide) => guide.species.includes(species) || guide.species.includes('All'));
  const relatedVideos = videos.filter((video) => video.species === species || video.species === 'All Pets').slice(0, 6);
  const relatedQuizzes = quizzes.filter((quiz) => quiz.species === species || quiz.species === 'All Pets').slice(0, 4);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm text-primary mb-2">Species information</p>
          <h1 className="mb-2">{species} First-Aid Resources</h1>
          <p className="text-muted-foreground">Guides, videos, and quizzes related to {species.toLowerCase()}.</p>
        </div>
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

export function ManageGuidePage({ onNavigate }: WorkflowPageProps) {
  const [status, setStatus] = useState('Draft');

  return (
    <ManagementShell title="Manage First-Aid Guide" description="Create, edit, delete, save draft, and submit guides for veterinary review." onNavigate={onNavigate}>
      <form className="grid lg:grid-cols-[1fr_320px] gap-6" onSubmit={(event) => { event.preventDefault(); setStatus('Pending Review'); }}>
        <section className="bg-white rounded-lg border border-border p-6">
          <label className="block mb-4">Guide title<input className="mt-2" defaultValue="Rabbit Heatstroke Guide" /></label>
          <label className="block mb-4">Species<select className="mt-2" defaultValue="Rabbits">{speciesOptions.map((species) => <option key={species}>{species}</option>)}</select></label>
          <label className="block mb-4">Severity<select className="mt-2" defaultValue="high"><option value="high">Seek Vet Now</option><option value="medium">Act Soon</option><option value="low">Monitor</option></select></label>
          <label className="block mb-4">Instructions<textarea rows={8} className="mt-2" defaultValue="Move the rabbit to a cool area. Offer water only if alert. Contact an exotic animal veterinarian immediately." /></label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStatus('Draft')} className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center gap-2"><Save className="w-4 h-4" />Save Draft</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Submit for Review</button>
          </div>
        </section>
        <aside className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-3">Guide Status</h2>
          <div className="rounded-lg bg-secondary text-secondary-foreground px-3 py-2 mb-4">{status}</div>
          <h3 className="mb-3">Existing Guides</h3>
          <div className="space-y-2">{draftGuides.map((guide) => <div key={guide.id} className="text-sm border border-border rounded p-2">{guide.title}</div>)}</div>
        </aside>
      </form>
    </ManagementShell>
  );
}

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

export function ManageClinicPage({ onNavigate }: WorkflowPageProps) {
  return (
    <ManagementShell title="Manage Vet Clinic" description="Add, edit, delete clinic details, opening hours, and emergency labels." onNavigate={onNavigate}>
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

export function ProfessionalDashboard({ onNavigate }: WorkflowPageProps) {
  const pending = draftGuides.filter((guide) => guide.status !== 'Published');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm text-primary mb-2">Veterinary professional</p>
          <h1 className="mb-2">Review Dashboard</h1>
          <p className="text-muted-foreground">Review submitted guide content, approve medically safe content, or request revisions.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Metric icon={ClipboardCheck} label="Pending Reviews" value={pending.length} />
          <Metric icon={CheckCircle} label="Approved This Month" value={6} />
          <Metric icon={AlertCircle} label="Revision Requests" value={2} />
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="mb-4">Pending Review Guides</h2>
          <div className="space-y-3">
            {pending.map((guide) => (
              <button key={guide.id} onClick={() => onNavigate('review-guide', { guideId: guide.id })} className="w-full text-left border border-border rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3>{guide.title}</h3>
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  </div>
                  <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded">{guide.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewGuidePage({ onNavigate, guideId = 'choking-emergency' }: WorkflowPageProps & { guideId?: string }) {
  const [decision, setDecision] = useState<string | null>(null);
  const guide = guides.find((item) => item.id === guideId) || guides[0];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="mb-2">Review Guide</h1>
          <p className="text-muted-foreground">Check clinical accuracy, leave comments, then approve or request changes.</p>
        </div>
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <article className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-2">{guide.title}</h2>
            <p className="text-muted-foreground mb-5">{guide.description}</p>
            <div className="space-y-3">
              {guide.steps.slice(0, 4).map((step) => (
                <div key={step.number} className="border border-border rounded-lg p-4">
                  <h3>{step.number}. {step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </article>
          <aside className="bg-white rounded-lg border border-border p-6">
            <h2 className="mb-4">Review Decision</h2>
            <label className="block mb-4">Review comments<textarea rows={6} className="mt-2" placeholder="Add clinical notes or required corrections." /></label>
            <button onClick={() => setDecision('Approved')} className="w-full mb-3 px-4 py-2 bg-success text-success-foreground rounded-md">Approve</button>
            <button onClick={() => setDecision('Changes Requested')} className="w-full px-4 py-2 bg-warning text-warning-foreground rounded-md">Request Changes</button>
            {decision && <div className="mt-4 rounded-lg bg-secondary p-3 text-secondary-foreground">Decision saved: {decision}</div>}
            <button onClick={() => onNavigate('professional-dashboard')} className="mt-4 text-primary hover:underline">Back to review dashboard</button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPage({ onNavigate }: WorkflowPageProps) {
  return (
    <SimpleListPage title="Notifications" description="Review alerts, revision messages, and approval status." onNavigate={onNavigate} icon={Bell}>
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

export function AuditLogPage({ onNavigate }: WorkflowPageProps) {
  return (
    <SimpleListPage title="Audit Log" description="Action history for content changes, review decisions, and approvals." onNavigate={onNavigate} icon={History}>
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

export function AdminWorkflowDashboard({ onNavigate }: WorkflowPageProps) {
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
