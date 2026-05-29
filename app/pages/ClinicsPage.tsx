import { MapPin, Search, Filter, Phone, AlertCircle, Navigation, Locate, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ClinicCard } from '../components/cards/ClinicCard';
import clinicImage from '../assets/clinic-location-care.png';
import { useApiData } from '../hooks/useApiData';
import { Clinic, EmergencyContact } from '../types/content';

interface ClinicsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

type FilterType = 'all' | 'emergency' | 'open';
type UserCoords = { lat: number; lng: number } | null;

/** Build the API URL based on current filter state */
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

export function ClinicsPage({ onNavigate }: ClinicsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [userCoords, setUserCoords] = useState<UserCoords>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Debounce text search — 400 ms
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const clinicUrl = useMemo(
    () => buildClinicUrl(debouncedSearch, filterType, userCoords),
    [debouncedSearch, filterType, userCoords],
  );

  const { data: clinics, loading: clinicsLoading, error: clinicsError } = useApiData<Clinic[]>(clinicUrl, []);
  const { data: emergencyContacts, loading: contactsLoading, error: contactsError } = useApiData<EmergencyContact[]>('/clinics/emergency-contacts', []);

  const loadError = clinicsError || contactsError;
  const isLoading = clinicsLoading || contactsLoading;

  const getDirectionsUrl = (clinic: Clinic) => {
    if (typeof clinic.lat === 'number' && typeof clinic.lng === 'number') {
      return `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name}, ${clinic.address}, ${clinic.city}`)}`;
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
        setLocationError('Unable to get your location. Please allow location access in your browser.');
      },
      { timeout: 10000 },
    );
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    setLocationError(null);
  };

  const getDistanceLabel = (clinic: Clinic) => {
    if (typeof clinic.distanceKm === 'number') {
      return `${clinic.distanceKm} km away`;
    }
    return clinic.distance;
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
            {/* Text search */}
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

            {/* Type filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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

            {/* Use my location */}
            {userCoords ? (
              <button
                onClick={handleClearLocation}
                className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success border border-success/30 rounded-md hover:bg-success/20 transition-colors text-sm whitespace-nowrap"
              >
                <MapPin className="w-4 h-4" />
                Sorted by distance
                <X className="w-3.5 h-3.5 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleUseMyLocation}
                disabled={loadingLocation}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Locate className="w-4 h-4" />
                {loadingLocation ? 'Getting location…' : 'Use my location'}
              </button>
            )}
          </div>

          {locationError && (
            <p className="text-xs text-destructive mb-3">{locationError}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {clinics.length} clinic{clinics.length !== 1 ? 's' : ''}
              {userCoords ? ' — sorted by distance from you' : ''}
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
