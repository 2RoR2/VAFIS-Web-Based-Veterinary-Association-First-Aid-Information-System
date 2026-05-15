import { MapPin, Search, Filter, Phone, AlertCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { ClinicCard } from '../components/cards/ClinicCard';
import { clinics, emergencyContacts } from '../data/clinics';
import clinicImage from '../assets/clinic-location-care.png';

interface ClinicsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ClinicsPage({ onNavigate }: ClinicsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getDirectionsUrl = (clinic: (typeof clinics)[number]) => {
    if (typeof clinic.lat === 'number' && typeof clinic.lng === 'number') {
      return `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name}, ${clinic.address}, ${clinic.city}`)}`;
  };

  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'emergency' && clinic.isEmergency) ||
      (filterType === 'open' && clinic.isOpen);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Find a Veterinary Clinic</h1>
          <p className="text-muted-foreground">Locate emergency veterinary services and clinics near your location.</p>
        </div>

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
                <p className="text-sm mb-1">{contact.name}</p>
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

        <div className="bg-white rounded-lg border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter your location or postcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-input rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Clinics</option>
                <option value="emergency">24/7 Emergency Only</option>
                <option value="open">Open Now</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredClinics.length} of {clinics.length} clinics - Sorted by distance
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-success rounded-full"></span>
              <span className="text-xs text-muted-foreground">Open Now</span>
              <span className="w-3 h-3 bg-destructive rounded-full ml-3"></span>
              <span className="text-xs text-muted-foreground">24/7 Emergency</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {filteredClinics.map((clinic) => (
            <ClinicCard
              key={clinic.id}
              name={clinic.name}
              address={`${clinic.address}, ${clinic.city}`}
              phone={clinic.phone}
              hours={clinic.hours}
              distance={clinic.distance}
              isOpen={clinic.isOpen}
              isEmergency={clinic.isEmergency}
              imageSrc={clinicImage}
              directionsUrl={getDirectionsUrl(clinic)}
            />
          ))}
        </div>

        {filteredClinics.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <p className="text-muted-foreground mb-2">No clinics found matching your search</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
