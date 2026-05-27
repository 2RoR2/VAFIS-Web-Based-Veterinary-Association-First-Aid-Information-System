import { Search, Filter, Eye, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { VideoCard } from '../components/cards/VideoCard';
import heroImage from '../assets/hero-pets-first-aid.png';
import videoTutorialImage from '../assets/video_tutorial.jpg';
import vetDashboardImage from '../assets/guided.jpg';
import { useApiData } from '../hooks/useApiData';
import { Video } from '../types/content';

interface VideoPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function VideoPage({ onNavigate }: VideoPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Videos');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'title'>('popular');
  const { data: videos, loading, error } = useApiData<Video[]>('/videos', []);

  const species = ['All', 'Dogs', 'Cats', 'Rabbits', 'Birds', 'Guinea Pigs', 'Hamsters', 'All Pets'];
  const videoImages = [
    videoTutorialImage,
    heroImage,
    vetDashboardImage,
  ];
  const videoCategories = useMemo(() => ['All Videos', ...new Set(videos.map((video) => video.category))], [videos]);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === 'all' || video.species.toLowerCase() === selectedSpecies;
    const matchesCategory = selectedCategory === 'All Videos' || video.category === selectedCategory;

    return matchesSearch && matchesSpecies && matchesCategory;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === 'popular') return b.views - a.views;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Educational Videos</h1>
          <p className="text-muted-foreground">
            Watch step-by-step demonstrations of first-aid techniques from veterinary professionals.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load videos. {error}
          </div>
        )}
        {loading && !error && (
          <p className="mb-4 text-sm text-muted-foreground">Loading videos...</p>
        )}

        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search videos by topic or species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'title')}
                className="px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="popular">Most Popular</option>
                <option value="title">Alphabetical</option>
              </select>
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
                {videoCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground flex items-center gap-4">
          <span>Showing {sortedVideos.length} of {videos.length} videos</span>
          {sortBy === 'popular' && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Sorted by popularity
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedVideos.map((video, index) => (
            <VideoCard
              key={video.id}
              title={video.title}
              duration={video.duration}
              species={video.species}
              thumbnail={video.thumbnail}
              imageSrc={videoImages[index % videoImages.length]}
              onClick={() => onNavigate('home')}
            />
          ))}
        </div>

        {sortedVideos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <p className="text-muted-foreground mb-2">No videos found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecies('all');
                setSelectedCategory('All Videos');
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
