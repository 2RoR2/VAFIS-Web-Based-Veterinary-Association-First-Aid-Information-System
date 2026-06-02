import { MapPin, Search, Filter, Grid, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GuideCard } from '../components/cards/GuideCard';
import { EmergencyBanner } from '../components/emergency/EmergencyBanner';
import { useApiData } from '../hooks/useApiData';
import { Guide } from '../types/content';

const SPECIES_OPTIONS = ['All', 'Dogs', 'Cats', 'Rabbits', 'Hamsters', 'Guinea Pigs', 'Birds'];

/** Build the search endpoint URL from active filter values. */
const buildSearchUrl = (q: string, species: string, category: string, severity: string): string => {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (species !== 'all') {
    // Convert lowercase state value back to proper-cased DB value e.g. 'dogs' → 'Dogs'
    const proper = SPECIES_OPTIONS.find((s) => s.toLowerCase() === species) ?? species;
    params.set('species', proper);
  }
  if (category !== 'All Categories') params.set('category', category);
  if (severity !== 'all') params.set('severity', severity);
  const qs = params.toString();
  return `/guides/search${qs ? `?${qs}` : ''}`;
};

interface EmergencyPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialSpecies?: string;
  initialSearch?: string;
}

// Renders the guide search page with keyword, species, category, and severity filters backed by the search API.
export function EmergencyPage({ onNavigate, initialSpecies, initialSearch }: EmergencyPageProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || '');
  const [selectedSpecies, setSelectedSpecies] = useState(initialSpecies?.toLowerCase() || 'all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce keyword so API is only called 400 ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset category when species changes — old category may not exist for the new species
  useEffect(() => {
    setSelectedCategory('All Categories');
  }, [selectedSpecies]);

  // The search URL encodes all active filters; useApiData re-fetches when it changes
  const searchUrl = useMemo(
    () => buildSearchUrl(debouncedSearch, selectedSpecies, selectedCategory, selectedSeverity),
    [debouncedSearch, selectedSpecies, selectedCategory, selectedSeverity],
  );

  const { data: guides, loading, error } = useApiData<Guide[]>(searchUrl, []);

  // Category options come from the current results (narrows with species/keyword filters)
  const categories = useMemo(
    () => ['All Categories', ...new Set(guides.map((g) => g.category))],
    [guides],
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Emergency First-Aid Guides</h1>
          <p className="text-muted-foreground">
            Step-by-step instructions for common pet emergencies. All guides are reviewed by veterinary professionals.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load guides. {error}
          </div>
        )}
        {loading && !error && (
          <p className="mb-4 text-sm text-muted-foreground">Loading guides...</p>
        )}

        <div className="mb-6">
          <EmergencyBanner onFindVet={() => onNavigate('clinics')} />
        </div>

        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by emergency, symptoms, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="flex-1 px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SPECIES_OPTIONS.map((s) => (
                    <option key={s} value={s.toLowerCase()}>
                      Species: {s}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="flex-1 px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Severities</option>
                <option value="high">Critical</option>
                <option value="medium">Moderate</option>
                <option value="low">Minor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? 'Searching…' : `${guides.length} guide${guides.length !== 1 ? 's' : ''} found`}
        </div>

        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              title={guide.title}
              severity={guide.severity}
              readTime={guide.readTime}
              description={guide.description}
              onClick={() => onNavigate('guide', { guideId: guide.id })}
            />
          ))}
        </div>

        {guides.length === 0 && !loading && !error && (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <p className="text-muted-foreground mb-2">No guides found matching your search</p>
            <p className="text-sm text-muted-foreground mb-6">
              Try different keywords or filters — or find a nearby clinic for immediate help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                  setSelectedSpecies('all');
                  setSelectedCategory('All Categories');
                  setSelectedSeverity('all');
                }}
                className="text-primary hover:underline"
              >
                Clear all filters
              </button>
              <span className="text-muted-foreground hidden sm:inline">or</span>
              <button
                onClick={() => onNavigate('clinics')}
                className="flex items-center gap-2 px-5 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Find a Vet Clinic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
