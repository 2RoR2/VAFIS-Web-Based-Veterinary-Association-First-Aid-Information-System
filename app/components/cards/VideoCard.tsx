import { Play, Clock } from 'lucide-react';

interface VideoCardProps {
  title: string;
  duration: string;
  species: string;
  thumbnail: string;
  imageSrc?: string;
  onClick: () => void;
}

export function VideoCard({ title, duration, species, thumbnail, imageSrc, onClick }: VideoCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-border hover:border-primary hover:shadow-md transition-all text-left overflow-hidden group"
    >
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {imageSrc && (
          <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/35 to-accent/25 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
        </div>
        {!imageSrc && <span className="text-4xl">{thumbnail}</span>}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{species}</span>
        </div>
        <h3 className="mb-2 group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {duration}
        </div>
      </div>
    </button>
  );
}
