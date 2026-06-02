import { FileText, LockKeyhole } from 'lucide-react';

interface PolicyPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const terms = [
  {
    title: '1. Acceptance of terms',
    body: 'By accessing or using VAFIS, you agree to use the platform only for lawful, responsible, and informational purposes. If you do not agree with these terms, you should not use the service.',
  },
  {
    title: '2. Veterinary disclaimer',
    body: 'VAFIS provides educational first-aid guidance only. It is not a veterinary clinic, telemedicine service, diagnostic tool, or substitute for advice from a licensed veterinarian.',
  },
  {
    title: '3. Emergency use',
    body: 'If a pet is injured, poisoned, unconscious, struggling to breathe, bleeding severely, or otherwise in distress, contact a veterinarian or emergency clinic immediately. First-aid content should be used only while arranging professional care.',
  },
  {
    title: '4. Accounts and roles',
    body: 'Role-based access is provided for pet owners, administrators, and veterinary professionals. Users are responsible for entering accurate information and keeping account access secure where authentication is enabled.',
  },
  {
    title: '5. User content and feedback',
    body: 'Feedback, ratings, comments, and content submissions may be reviewed for quality improvement, moderation, workflow testing, and administrative oversight.',
  },
  {
    title: '6. Prohibited activity',
    body: 'Users may not misuse the platform, submit false or harmful information, attempt unauthorized access, interfere with system operation, or use VAFIS to provide unlicensed veterinary services.',
  },
  {
    title: '7. Content changes and availability',
    body: 'VAFIS content, workflows, and features may be updated, removed, or unavailable at any time. Prototype features are provided for demonstration and may not represent production behavior.',
  },
  {
    title: '8. Limitation of liability',
    body: 'To the fullest extent permitted by applicable law, VAFIS and its operators are not liable for losses resulting from reliance on educational content, delayed professional care, user-submitted information, or prototype service interruptions.',
  },
];

const privacy = [
  {
    title: '1. Information we collect',
    body: 'VAFIS may collect information entered into the prototype, including account role, name, email, pet profiles, quiz answers, feedback, ratings, clinic search input, and administrative workflow entries.',
  },
  {
    title: '2. How information is used',
    body: 'Information is used to provide page navigation, personalize pet-related workflows, display quiz results, route feedback, support content review, and demonstrate administrator or veterinary professional dashboards.',
  },
  {
    title: '3. Feedback and review data',
    body: 'Feedback and review examples may be displayed in administrative screens to demonstrate content quality workflows, moderation, notifications, and audit history.',
  },
  {
    title: '4. Location and clinic search',
    body: 'Clinic search currently uses sample clinic data and typed search input. If browser location access is added later, users should be asked for permission before location data is used.',
  },
  {
    title: '5. Sharing and disclosure',
    body: 'Prototype data is not sold. In a production environment, information may be shared only with authorized administrators, veterinary reviewers, service providers, or where required by law.',
  },
  {
    title: '6. Security',
    body: 'Reasonable safeguards should be used to protect account and workflow data in production. This prototype is not intended to store sensitive medical, payment, or confidential personal information.',
  },
  {
    title: '7. User choices',
    body: 'Users should avoid entering sensitive information into prototype forms. In production, users should be able to request access, correction, or deletion of eligible personal data.',
  },
];

// Renders the Terms of Use page by passing the terms data to PolicyLayout.
export function TermsPage({ onNavigate }: PolicyPageProps) {
  return (
    <PolicyLayout
      icon={FileText}
      eyebrow="VAFIS terms"
      title="Terms of Use"
      description="Please read these terms before using VAFIS. They explain responsible use of veterinary first-aid information and role-based workflows."
      items={terms}
      onNavigate={onNavigate}
    />
  );
}

// Renders the Privacy Policy page by passing the privacy data to PolicyLayout.
export function PrivacyPage({ onNavigate }: PolicyPageProps) {
  return (
    <PolicyLayout
      icon={LockKeyhole}
      eyebrow="VAFIS privacy"
      title="Privacy Policy"
      description="This policy explains how VAFIS handles prototype inputs, pet profiles, feedback, quiz activity, and workflow data."
      items={privacy}
      onNavigate={onNavigate}
    />
  );
}

// Shared layout for both policy pages, rendering an icon, title, description, effective date, and a list of policy sections.
function PolicyLayout({
  icon: Icon,
  eyebrow,
  title,
  description,
  items,
  onNavigate,
}: PolicyPageProps & {
  icon: typeof FileText;
  eyebrow: string;
  title: string;
  description: string;
  items: { title: string; body: string }[];
}) {
  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="bg-white rounded-[2rem] border border-border p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-secondary text-primary flex items-center justify-center mb-6">
            <Icon className="w-7 h-7" />
          </div>
          <p className="text-sm text-primary mb-2">{eyebrow}</p>
          <h1 className="text-4xl mb-3">{title}</h1>
          <p className="text-muted-foreground mb-8">{description}</p>
          <div className="mb-8 rounded-xl border border-border bg-secondary/60 p-4">
            <p className="text-sm text-secondary-foreground">Effective date: May 16, 2026</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This page is written for a prototype and should be reviewed by qualified legal counsel before production use.
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.title} className="rounded-xl border border-border bg-background p-5">
                <h2 className="mb-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => onNavigate('home')} className="px-5 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Back Home
            </button>
            <button onClick={() => onNavigate('feedback')} className="px-5 py-2 border border-border rounded-md hover:bg-muted transition-colors">
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
