import { MapPin, Search, Filter, Phone, AlertCircle, Locate, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ClinicCard } from '../components/cards/ClinicCard';
import clinicImage from '../assets/clinic-location-care.png';
import { useApiData } from '../hooks/useApiData';
import { Clinic, EmergencyContact } from '../types/content';
import { LocationService } from '../services/LocationService';

interface ClinicsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

type FilterType = 'all' | 'emergency' | 'open';
type LocationStatus = 'requesting' | 'granted' | 'denied' | 'manual';
type UserCoords = { lat: number; lng: number } | null;

// Predefined Kuching areas used for manual location selection
const KUCHING_AREAS = [
  { label: 'Kuching City Centre',  lat: 1.5535, lng: 110.3493 },
  { label: 'Tun Jugah / 3rd Mile', lat: 1.5261, lng: 110.3593 },
  { label: 'Jalan Song',           lat: 1.5269, lng: 110.3784 },
  { label: 'Stutong',              lat: 1.5128, lng: 110.3822 },
  { label: 'Pending',              lat: 1.5534, lng: 110.3781 },
  { label: 'Petra Jaya',           lat: 1.5716, lng: 110.3458 },
  { label: 'Batu Kawa',            lat: 1.5163, lng: 110.2917 },
  { label: 'Kota Samarahan',       lat: 1.4599, lng: 110.4983 },
];

// Builds the clinic API endpoint URL based on search term, filter type, and user coordinates.
// Uses the /clinics/nearby endpoint when coordinates are available, otherwise /clinics.
const buildClinicUrl = (
  debouncedSearch: string,
  filterType: FilterType,
  userCoords: UserCoords,
): string => {
  const qp = new URLSearchParams();
  if (debouncedSearch.trim()) qp.set('q', debouncedSearch.trim());
  if (filterType === 'emergency') qp.set('emergency', 'true');
  if (filterType === 'open') qp.set('open', 'true');

  if (userCoords) {
    qp.set('lat', String(userCoords.lat));
    qp.set('lng', String(userCoords.lng));
    return `/clinics/nearby?${qp.toString()}`;
  }

  const qs = qp.toString();
  return qs ? `/clinics?${qs}` : '/clinics';
};

// Renders the clinic finder page with GPS-based or manual area proximity sorting, text search, and filter controls.
export function ClinicsPage({ onNavigate }: ClinicsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [userCoords, setUserCoords] = useState<UserCoords>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus | null>(null);
  const [selectedArea, setSelectedArea] = useState('');

  // Debounce text search — 400 ms
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Auto-request location on mount via LocationService
  useEffect(() => {
    setLocationStatus('requesting');
    LocationService.getCurrentCoordinates({ timeout: 10000 })
      .then((coords) => {
        setUserCoords(coords);
        setLocationStatus('granted');
      })
      .catch(() => {
        // Access denied or unsupported — prompt for manual entry
        setLocationStatus('denied');
      });
  }, []);

  // Sets the user's coordinates from the selected Kuching area and switches to manual location mode.
  const handleManualAreaSubmit = () => {
    const area = KUCHING_AREAS.find((a) => a.label === selectedArea);
    if (!area) return;
    setUserCoords({ lat: area.lat, lng: area.lng });
    setLocationStatus('manual');
  };

  // Clears the user's coordinates and resets the location status to denied so they can re-enter.
  const handleClearLocation = () => {
    setUserCoords(null);
    setLocationStatus('denied');
    setSelectedArea('');
  };

  const clinicUrl = useMemo(
    () => buildClinicUrl(debouncedSearch, filterType, userCoords),
    [debouncedSearch, filterType, userCoords],
  );

  const { data: clinics, loading: clinicsLoading, error: clinicsError } = useApiData<Clinic[]>(clinicUrl, []);
  const { data: emergencyContacts, loading: contactsLoading, error: contactsError } = useApiData<EmergencyContact[]>('/clinics/emergency-contacts', []);

  const loadError = clinicsError || contactsError;
  const isLoading = clinicsLoading || contactsLoading;

  // Returns a Google Maps directions URL using GPS coordinates if available, otherwise falls back to a name+address search URL.
  const getDirectionsUrl = (clinic: Clinic) => {
    if (typeof clinic.lat === 'number' && typeof clinic.lng === 'number') {
      return `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name}, ${clinic.address}, ${clinic.city}`)}`;
  };

  // Returns a human-readable distance string for a clinic if the user's coordinates are known.
  const getDistanceLabel = (clinic: Clinic): string | undefined => {
    if (!userCoords) return undefined;
    if (typeof clinic.distanceKm === 'number') return `${clinic.distanceKm} km away`;
    return undefined;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Find a Veterinary Clinic</h1>
          <p className="text-muted-foreground">Locate emergency veterinary services and clinics near your location.</p>
        </div>

        {loadError && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load clinic data. {loadError}
          </div>
        )}
        {isLoading && !loadError && (
          <p className="mb-4 text-sm text-muted-foreground">Loading clinics...</p>
        )}

        {/* Location banner — shown while requesting or when denied */}
        {locationStatus === 'requesting' && (
          <div className="mb-6 rounded-lg border border-border bg-white px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
            <Locate className="w-4 h-4 animate-pulse shrink-0" />
            Requesting your location to find nearby clinics…
          </div>
        )}

        {locationStatus === 'denied' && (
          <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 p-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location access was denied. Select your area to find nearby clinics:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="flex-1 px-3 py-2 border border-input rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Choose your area —</option>
                {KUCHING_AREAS.map((area) => (
                  <option key={area.label} value={area.label}>{area.label}</option>
                ))}
              </select>
              <button
                onClick={handleManualAreaSubmit}
                disabled={!selectedArea}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Find Nearby Clinics
              </button>
            </div>
          </div>
        )}

        {/* Emergency contacts banner */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6">
          <h3 className="text-destructive mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            In a Life-Threatening Emergency?
          </h3>
          <p className="text-sm text-destructive/80 mb-4">
            Call the nearest 24/7 emergency clinic immediately. Do not delay seeking professional help.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.name} className="bg-white rounded-lg p-4">
                <p className="text-sm font-medium mb-1">{contact.name}</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-destructive hover:underline flex items-center gap-2 mb-2"
                >
                  <Phone className="w-4 h-4" />
                  {contact.phone}
                </a>
                <p className="text-xs text-muted-foreground">{contact.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-lg border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, address, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Clinics</option>
                <option value="emergency">24/7 Emergency Only</option>
                <option value="open">Open Now</option>
              </select>
            </div>

            {/* Location status button */}
            {userCoords ? (
              <button
                onClick={handleClearLocation}
                className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success border border-success/30 rounded-md hover:bg-success/20 transition-colors text-sm whitespace-nowrap"
              >
                <MapPin className="w-4 h-4" />
                {locationStatus === 'manual' ? `Near ${selectedArea}` : 'Sorted by distance'}
                <X className="w-3.5 h-3.5 ml-1" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setLocationStatus('requesting');
                  LocationService.getCurrentCoordinates({ timeout: 10000 })
                    .then((coords) => {
                      setUserCoords(coords);
                      setLocationStatus('granted');
                    })
                    .catch(() => setLocationStatus('denied'));
                }}
                disabled={locationStatus === 'requesting'}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Locate className="w-4 h-4" />
                {locationStatus === 'requesting' ? 'Getting location…' : 'Use my location'}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {clinics.length} clinic{clinics.length !== 1 ? 's' : ''}
              {userCoords ? ' — sorted by distance' : ''}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-success rounded-full"></span>
                <span className="text-xs text-muted-foreground">Open Now</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-destructive rounded-full"></span>
                <span className="text-xs text-muted-foreground">24/7 Emergency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {clinics.map((clinic) => (
            <ClinicCard
              key={clinic.id}
              name={clinic.name}
              address={`${clinic.address}, ${clinic.city}`}
              phone={clinic.phone}
              hours={clinic.hours}
              distance={getDistanceLabel(clinic)}
              isOpen={clinic.isOpen}
              isEmergency={clinic.isEmergency}
              imageSrc={clinicImage}
              directionsUrl={getDirectionsUrl(clinic)}
            />
          ))}
        </div>

        {clinics.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <p className="text-muted-foreground mb-2">No clinics found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setUserCoords(null);
                setLocationStatus(null);
                setSelectedArea('');
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
