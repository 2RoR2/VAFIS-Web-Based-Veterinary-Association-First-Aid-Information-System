import { AlertTriangle, Phone } from 'lucide-react';

interface EmergencyBannerProps {
  onFindVet: () => void;
}

// Displays a prominent red banner reminding users that this is first-aid guidance only, with a button to find a nearby vet.
export function EmergencyBanner({ onFindVet }: EmergencyBannerProps) {
  return (
    <div className="bg-destructive text-destructive-foreground rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="mb-1">Emergency: Seek Professional Help Immediately</h3>
        <p className="text-sm opacity-90 mb-3">
          This information is for first-aid guidance only. For serious emergencies, contact a veterinarian right away.
        </p>
        <button
          onClick={onFindVet}
          className="bg-white text-destructive px-4 py-2 rounded-md hover:bg-white/90 transition-colors inline-flex items-center gap-2"
        >
          <Phone className="w-4 h-4" />
          Find Nearest Vet Clinic
        </button>
      </div>
    </div>
  );
}
