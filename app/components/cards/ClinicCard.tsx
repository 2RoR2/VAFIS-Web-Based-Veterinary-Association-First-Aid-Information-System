import { MapPin, Phone, Clock, Navigation } from 'lucide-react';

interface ClinicCardProps {
  name: string;
  address: string;
  phone: string;
  hours: string;
  distance: string;
  isOpen: boolean;
  isEmergency: boolean;
  imageSrc?: string;
  directionsUrl: string;
}

export function ClinicCard({ name, address, phone, hours, distance, isOpen, isEmergency, imageSrc, directionsUrl }: ClinicCardProps) {
  return (
    <div className="paw-card bg-white p-5 rounded-2xl border border-border hover:border-primary hover:shadow-md transition-all">
      {imageSrc && (
        <img src={imageSrc} alt="" className="w-full aspect-[5/2] object-cover rounded-xl border border-border mb-4" />
      )}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="mb-1">{name}</h3>
          {isEmergency && (
            <span className="inline-block px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded">
              24/7 Emergency
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">{distance}</div>
          <div className={`text-xs ${isOpen ? 'text-success' : 'text-destructive'}`}>
            {isOpen ? 'Open Now' : 'Closed'}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{hours}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={`tel:${phone}`}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-center"
        >
          Call Now
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </a>
      </div>
    </div>
  );
}
