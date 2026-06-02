import { ArrowRight, BookOpen, Brain, HelpCircle, MapPin, Phone, Search, ShieldCheck, Star, TrendingUp, Video } from 'lucide-react';
import clinicImage from '../assets/clinic-location-care.png';
import clinicDirectoryImage from '../assets/clinic_directory.jpg';
import emergencyScenarioImage from '../assets/emergency_scenario.png';
import guidedImage from '../assets/guided.jpg';
import heroBackgroundImage from '../assets/hero_image_background.png';
import heroImage from '../assets/hero-pets-first-aid.png';
import quizImage from '../assets/quiz.png';
import videoTutorialImage from '../assets/video_tutorial.jpg';
import birdImage from '../assets/species-bird.png';
import catImage from '../assets/species-cat.png';
import dogImage from '../assets/species-dog.png';
import guineaPigImage from '../assets/species-guinea-pig.png';
import hamsterImage from '../assets/species-hamster.png';
import rabbitImage from '../assets/species-rabbit.png';
import { useApiData } from '../hooks/useApiData';
import { Clinic, Guide, Quiz, Video as VideoItem } from '../types/content';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

// Renders the public landing page with featured guides, species selector, resource cards, and FAQ section.
export function HomePage({ onNavigate }: HomePageProps) {
  const { data: guides, loading: guidesLoading, error: guidesError } = useApiData<Guide[]>('/guides', []);
  const { data: videos, loading: videosLoading, error: videosError } = useApiData<VideoItem[]>('/videos', []);
  const { data: quizzes, loading: quizzesLoading, error: quizzesError } = useApiData<Quiz[]>('/quizzes', []);
  const { data: clinics, loading: clinicsLoading, error: clinicsError } = useApiData<Clinic[]>('/clinics', []);
  const imageAssets = {
    hero: heroImage,
    heroBackground: heroBackgroundImage,
    emergencyScenario: emergencyScenarioImage,
    guided: guidedImage,
    quiz: quizImage,
    videoTutorial: videoTutorialImage,
    clinic: clinicImage,
    clinicDirectory: clinicDirectoryImage,
  };

  const species = [
    { name: 'Dogs', imageSrc: dogImage, count: guides.filter((guide) => guide.species.includes('Dogs')).length },
    { name: 'Cats', imageSrc: catImage, count: guides.filter((guide) => guide.species.includes('Cats')).length },
    { name: 'Rabbits', imageSrc: rabbitImage, count: guides.filter((guide) => guide.species.includes('Rabbits')).length },
    { name: 'Hamsters', imageSrc: hamsterImage, count: guides.filter((guide) => guide.species.includes('Hamsters')).length },
    { name: 'Guinea Pigs', imageSrc: guineaPigImage, count: guides.filter((guide) => guide.species.includes('Guinea Pigs')).length },
    { name: 'Birds', imageSrc: birdImage, count: guides.filter((guide) => guide.species.includes('Birds')).length },
  ];

  const featuredGuides = guides.filter((guide) => guide.severity === 'high').slice(0, 3);
  const resourceCards = [
    {
      title: 'Emergency Guides',
      description: 'Step-by-step first-aid instructions reviewed by veterinarians.',
      image: imageAssets.emergencyScenario,
      icon: BookOpen,
      action: () => onNavigate('emergency'),
    },
    {
      title: 'Video Tutorials',
      description: videos[0]?.title ?? 'See the latest veterinarian-led tutorials.',
      image: imageAssets.videoTutorial,
      icon: Video,
      action: () => onNavigate('videos'),
    },
    {
      title: 'Interactive Quizzes',
      description: quizzes[0]
        ? `${quizzes[0].questions.length} question starter quiz for pet first-aid readiness.`
        : 'Test your readiness with guided quizzes.',
      image: imageAssets.quiz,
      icon: Brain,
      action: () => onNavigate('quiz'),
    },
    {
      title: 'Clinic Directory',
      description: `${clinics.filter((clinic) => clinic.isEmergency).length} emergency clinics listed near Kuching.`,
      image: imageAssets.clinicDirectory,
      icon: MapPin,
      action: () => onNavigate('clinics'),
    },
  ];

  const faqItems = [
    'What should I do first in a pet emergency?',
    'How do I know when to seek a veterinarian?',
    'Can I search guides by species?',
    'Where can I find nearby emergency clinics?',
  ];
  const hasLoading = guidesLoading || videosLoading || quizzesLoading || clinicsLoading;
  const loadError = guidesError || videosError || quizzesError || clinicsError;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground text-center text-sm py-2">
        Veterinarian-reviewed first-aid guidance for urgent pet care moments
      </div>

      <section className="relative z-20 overflow-visible bg-secondary/50 border-b border-border">
        <div className="absolute left-6 top-8 paw-badge w-16 h-16 opacity-30" aria-hidden="true" />
        <div className="absolute right-8 bottom-8 paw-badge w-20 h-20 opacity-30" aria-hidden="true" />
        <img
          src={imageAssets.heroBackground}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-38.5 left-1/2 z-30 hidden w-[620px] max-w-[46vw] -translate-x-1/2 object-contain drop-shadow-sm lg:block"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadError && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Unable to load dashboard content. {loadError}
            </div>
          )}
          {hasLoading && !loadError && (
            <p className="mb-6 text-sm text-muted-foreground">Loading content...</p>
          )}
          <div className="grid lg:grid-cols-[260px_1fr_300px] gap-8 items-center py-12 lg:py-16">
            <aside className="hidden lg:block bg-primary text-primary-foreground rounded-[2rem] p-6 shadow-sm">
              <p className="text-sm opacity-90 mb-3">Quick access</p>
              <h2 className="text-2xl mb-4">Need help now?</h2>
              <p className="text-sm opacity-90 mb-6">Search by symptom and go straight to a matching first-aid guide.</p>
              <button
                onClick={() => onNavigate('search')}
                className="w-full bg-white text-primary px-4 py-2 rounded-full hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Emergency Search
              </button>
            </aside>

            <div className="text-center">
              <p className="text-sm text-primary mb-3">VAFIS pet first-aid support</p>
              <h1 className="text-4xl lg:text-6xl leading-tight max-w-4xl mx-auto mb-4">
                Good care for pets, clear help for people
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-7">
                Access reliable emergency guides, learning videos, quizzes, and nearby clinic information in one calm place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => onNavigate('emergency')}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Browse Guides
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('clinics')}
                  className="px-6 py-3 bg-white border border-border rounded-full hover:border-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Find a Vet
                </button>
              </div>

            </div>

            <div className="paw-card bg-white rounded-[2rem] p-3 border border-border shadow-sm">
              <img
                src={imageAssets.hero}
                alt="Dog and cat beside a pet first-aid kit"
                className="w-full aspect-[4/5] object-cover rounded-[1.5rem]"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm">Pawsitive</span>
                </div>
                <p className="text-sm text-muted-foreground">Vet-first aid, anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-primary mb-2">Popular categories</p>
            <h2>Select Your Pet Species</h2>
          </div>
          <button onClick={() => onNavigate('emergency')} className="hidden sm:flex text-primary hover:underline items-center gap-1">
            View all guides
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {species.map((item) => (
            <button
              key={item.name}
              onClick={() => onNavigate('species', { species: item.name })}
              className="bg-white border border-border rounded-[2rem] p-4 hover:border-primary hover:shadow-md transition-all text-center"
            >
              <img src={item.imageSrc} alt={`${item.name} species`} className="w-24 h-24 mx-auto object-cover rounded-full border border-border mb-3" />
              <h3 className="mb-1">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.count} guides</p>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-primary mb-2">Trending resources</p>
                <h2>Emergency care essentials</h2>
              </div>
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                Are you ready?
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {resourceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.title}
                    onClick={card.action}
                    className="relative min-h-[440px] overflow-hidden rounded-[1.5rem] border border-border text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
                  >
                    <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-secondary/25" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mb-2 text-white">{card.title}</h3>
                      <p className="mb-4 text-sm text-white/90">{card.description}</p>
                      <span className="inline-flex items-center gap-1 text-sm text-white">
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-[1.5rem] border border-border p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-primary mb-1">Frequently asked</p>
                  <h2>Emergency questions</h2>
                </div>
                <HelpCircle className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-3">
                {faqItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => onNavigate('search', { search: item })}
                    className="w-full border border-border rounded-full px-4 py-3 text-left text-sm hover:border-primary hover:bg-muted transition-colors flex items-center justify-between gap-3"
                  >
                    {item}
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-destructive text-destructive-foreground rounded-[1.5rem] p-6">
              <h2 className="mb-2">Life-threatening emergency?</h2>
              <p className="text-sm opacity-90 mb-5">Use the clinic directory while following first-aid guidance. Professional help should not be delayed.</p>
              <button
                onClick={() => onNavigate('clinics')}
                className="w-full bg-white text-destructive rounded-full px-4 py-2 hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Find nearest clinic
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-secondary/70 p-6">
              <div className="absolute -right-8 -top-8 paw-badge h-28 w-28 opacity-25" aria-hidden="true" />
              <p className="text-sm text-primary mb-2">First-aid flow</p>
              <h2 className="mb-5">Stay calm and move step by step</h2>
              <div className="space-y-3">
                {[
                  ['Pick species', 'Start with the pet type for safer guidance.'],
                  ['Search symptoms', 'Use simple words like choking or bleeding.'],
                  ['Open guide', 'Follow reviewed steps and warning signs.'],
                ].map(([title, detail], index) => (
                  <button
                    key={title}
                    onClick={() => onNavigate(index === 2 ? 'emergency' : 'search')}
                    className="w-full rounded-2xl border border-border bg-white/85 p-4 text-left shadow-sm transition-colors hover:border-primary"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-base">{title}</h3>
                        <p className="text-xs text-muted-foreground">{detail}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white border-y border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-primary mb-2">Common emergency guides</p>
              <h2>Start with these high-priority topics</h2>
            </div>
            <button onClick={() => onNavigate('emergency')} className="text-primary hover:underline flex items-center gap-1">
              Browse all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => onNavigate('guide', { guideId: guide.id })}
                className="bg-background border border-border rounded-[1.25rem] p-5 text-left hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs">
                    {guide.severity === 'high' ? 'Seek Vet Now' : guide.severity}
                  </span>
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <h3 className="mb-2">{guide.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                <span className="text-xs text-muted-foreground">{guide.readTime}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
          <div className="rounded-[2rem] overflow-hidden border border-border bg-white">
            <img src={imageAssets.guided} alt="Pet owner using guided first-aid learning content" className="w-full aspect-[4/3] object-cover" />
          </div>
          <div>
            <p className="text-sm text-primary mb-2">Learning that feels guided</p>
            <h2 className="text-3xl mb-4">Watch, quiz, and build confidence before emergencies happen</h2>
            <p className="text-muted-foreground mb-6">
              Explore guided tutorials, interactive quizzes, and practical first-aid knowledge to help you stay prepared when your pet needs you most.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white border border-border rounded-[1.25rem] p-4">
                <div className="text-2xl text-primary">{guides.length}</div>
                <p className="text-sm text-muted-foreground">Guides</p>
              </div>
              <div className="bg-white border border-border rounded-[1.25rem] p-4">
                <div className="text-2xl text-primary">{videos.length}</div>
                <p className="text-sm text-muted-foreground">Videos</p>
              </div>
              <div className="bg-white border border-border rounded-[1.25rem] p-4">
                <div className="text-2xl text-primary">{quizzes.length}</div>
                <p className="text-sm text-muted-foreground">Quizzes</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onNavigate('videos')} className="px-5 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                Watch videos
              </button>
              <button onClick={() => onNavigate('quiz')} className="px-5 py-2 bg-white border border-border rounded-full hover:border-primary transition-colors">
                Take quiz
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
