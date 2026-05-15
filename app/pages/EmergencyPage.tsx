import { Search, Filter, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { GuideCard } from '../components/cards/GuideCard';
import { EmergencyBanner } from '../components/emergency/EmergencyBanner';
import { guides, categories } from '../data/guides';

interface EmergencyPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialSpecies?: string;
  initialSearch?: string;
}

export function EmergencyPage({ onNavigate, initialSpecies, initialSearch }: EmergencyPageProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedSpecies, setSelectedSpecies] = useState(initialSpecies?.toLowerCase() || 'all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const species = ['All', 'Dogs', 'Cats', 'Rabbits', 'Hamsters', 'Guinea Pigs', 'Birds'];

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === 'all' ||
      guide.species.includes(selectedSpecies) ||
      guide.species.includes('All');
    const matchesCategory = selectedCategory === 'All Categories' || guide.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || guide.severity === selectedSeverity;

    return matchesSearch && matchesSpecies && matchesCategory && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Emergency First-Aid Guides</h1>
          <p className="text-muted-foreground">
            Step-by-step instructions for common pet emergencies. All guides are reviewed by veterinary professionals.
          </p>
        </div>

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
                  {species.map((s) => (
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
          Showing {filteredGuides.length} of {guides.length} guides
        </div>

        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredGuides.map((guide) => (
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

        {filteredGuides.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <p className="text-muted-foreground mb-2">No guides found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecies('all');
                setSelectedCategory('All Categories');
                setSelectedSeverity('all');
              }}
              className="text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
