import { Search, Filter, Eye, TrendingUp, ChevronRight, BookOpen, User, Clock, BarChart2, MapPin } from 'lucide-react';
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

// Fetches and displays a single video by ID with an embedded player, metadata, linked guide, and find-a-vet prompt.

interface VideoPlayerPageProps {
  videoId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function VideoPlayerPage({ videoId, onNavigate }: VideoPlayerPageProps) {
  const { data: video, loading, error } = useApiData<Video | null>(`/videos/${videoId}`, null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <p className="text-destructive mb-4">{error ?? 'Video not found.'}</p>
            <button
              onClick={() => onNavigate('videos')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    Beginner: 'bg-success/10 text-success',
    Intermediate: 'bg-warning/10 text-warning-foreground',
    Advanced: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => onNavigate('home')} className="hover:text-primary">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => onNavigate('videos')} className="hover:text-primary">Videos</button>
          <ChevronRight className="w-4 h-4" />
          <span className="truncate">{video.title}</span>
        </div>

        {/* Embedded player */}
        <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-lg">
          {video.videoUrl ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`${video.videoUrl}?rel=0&modestbranding=1`}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Video not available</p>
            </div>
          )}
        </div>

        {/* Video info */}
        <div className="bg-white rounded-lg border border-border p-6 mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">{video.species}</span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">{video.category}</span>
            <span className={`px-2 py-1 text-xs rounded ${difficultyColors[video.difficulty]}`}>
              {video.difficulty}
            </span>
          </div>

          <h1 className="mb-3">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><User className="w-4 h-4" />{video.instructor}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{video.duration}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{video.views.toLocaleString()} views</span>
          </div>

          <p className="text-muted-foreground">{video.description}</p>
        </div>

        {/* Link back to associated guide */}
        {video.relatedGuideId && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Associated First-Aid Guide</p>
                <p className="text-sm text-muted-foreground">Read the step-by-step guide that goes with this video.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('guide', { guideId: video.relatedGuideId })}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              View Guide
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Find a vet */}
        <div className="bg-white border border-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium">Is this an active emergency?</p>
              <p className="text-sm text-muted-foreground">Find a nearby vet clinic for immediate professional help.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('clinics')}
            className="px-5 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            Find a Vet
          </button>
        </div>

      </div>
    </div>
  );
}

// Renders the video library with keyword search, species/category filters, and sort controls.
export function VideoPage({ onNavigate }: VideoPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Videos');
  const [sortBy, setSortBy] = useState<'popular' | 'title'>('popular');
  const { data: videos, loading, error } = useApiData<Video[]>('/videos', []);

  const species = ['All', 'Dogs', 'Cats', 'Rabbits', 'Birds', 'Guinea Pigs', 'Hamsters', 'All Pets'];
  const videoImages = [videoTutorialImage, heroImage, vetDashboardImage];
  const videoCategories = useMemo(() => ['All Videos', ...new Set(videos.map((v) => v.category))], [videos]);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === 'all' || video.species.toLowerCase() === selectedSpecies;
    const matchesCategory = selectedCategory === 'All Videos' || video.category === selectedCategory;
    return matchesSearch && matchesSpecies && matchesCategory;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === 'popular') return b.views - a.views;
    return a.title.localeCompare(b.title);
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
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'title')}
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
              onClick={() => onNavigate('video', { videoId: video.id })}
            />
          ))}
        </div>

        {sortedVideos.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <p className="text-muted-foreground mb-2">No videos found matching your filters</p>
            <p className="text-sm text-muted-foreground mb-6">
              Try different keywords — or browse first-aid guides for written instructions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => { setSearchTerm(''); setSelectedSpecies('all'); setSelectedCategory('All Videos'); }}
                className="text-primary hover:underline"
              >
                Clear all filters
              </button>
              <span className="text-muted-foreground hidden sm:inline">or</span>
              <button
                onClick={() => onNavigate('emergency')}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Browse First-Aid Guides
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
