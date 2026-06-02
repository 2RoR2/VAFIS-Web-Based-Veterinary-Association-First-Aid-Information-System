interface SpeciesCardProps {
  name: string;
  icon: string;
  imageSrc?: string;
  count: number;
  onClick: () => void;
}

// Displays a species selection card with an image or emoji icon and the number of available guides.
export function SpeciesCard({ name, icon, imageSrc, count, onClick }: SpeciesCardProps) {
  return (
    <button
      onClick={onClick}
      className="paw-card bg-white p-4 rounded-2xl border border-border hover:border-primary hover:shadow-md transition-all text-center group"
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${name} species`}
          className="w-full aspect-square object-cover rounded-2xl border border-border mb-4"
        />
      ) : (
        <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center text-sm font-medium border border-border">
          {icon}
        </div>
      )}
      <h3 className="mb-1 group-hover:text-primary transition-colors">{name}</h3>
      <p className="text-sm text-muted-foreground">{count} guides available</p>
    </button>
  );
}
