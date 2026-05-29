import { ArrowLeft, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { Clinic } from '../../types/content';

interface AddEditClinicPageProps {
  onNavigate: (page: string, data?: any) => void;
  clinicId?: string;
}

const SPECIES_OPTIONS = [
  'Dogs', 'Cats', 'Rabbits', 'Birds', 'Guinea Pigs',
  'Hamsters', 'Reptiles', 'Exotic Pets', 'Small Animals',
];

const emptyForm = {
  name:        '',
  address:     '',
  city:        '',
  phone:       '',
  email:       '',
  website:     '',
  hours:       '',
  isEmergency: false,
  species:     [] as string[],
  services:    [] as string[],
  lat:         '',
  lng:         '',
};

export function AddEditClinicPage({ onNavigate, clinicId }: AddEditClinicPageProps) {
  const isEdit = Boolean(clinicId);

  const [form, setForm]             = useState(emptyForm);
  const [serviceInput, setServiceInput] = useState('');
  const [loading, setLoading]       = useState(isEdit);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving]         = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit || !clinicId) return;
    apiGet<Clinic>(`/clinics/${clinicId}`)
      .then((data) => {
        setForm({
          name:        data.name,
          address:     data.address,
          city:        data.city,
          phone:       data.phone,
          email:       data.email,
          website:     data.website ?? '',
          hours:       data.hours,
          isEmergency: data.isEmergency,
          species:     data.species,
          services:    data.services,
          lat:         data.lat !== undefined && data.lat !== null ? String(data.lat) : '',
          lng:         data.lng !== undefined && data.lng !== null ? String(data.lng) : '',
        });
      })
      .catch((err) => setFetchError(err.message ?? 'Failed to load clinic.'))
      .finally(() => setLoading(false));
  }, [clinicId, isEdit]);

  /* ── Field helpers ─────────────────────────────────────────────────────── */

  const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSpecies = (sp: string) =>
    setForm((prev) => ({
      ...prev,
      species: prev.species.includes(sp)
        ? prev.species.filter((s) => s !== sp)
        : [...prev.species, sp],
    }));

  const addService = () => {
    const trimmed = serviceInput.trim();
    if (!trimmed || form.services.includes(trimmed)) { setServiceInput(''); return; }
    setForm((prev) => ({ ...prev, services: [...prev.services, trimmed] }));
    setServiceInput('');
  };

  const removeService = (item: string) =>
    setForm((prev) => ({ ...prev, services: prev.services.filter((s) => s !== item) }));

  /* ── Validation ────────────────────────────────────────────────────────── */

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = 'Clinic name is required.';
    if (!form.address.trim()) e.address = 'Address is required.';
    if (!form.city.trim())    e.city    = 'City is required.';
    if (!form.phone.trim())   e.phone   = 'Phone number is required.';
    if (!form.email.trim())   e.email   = 'Email address is required.';
    if (!form.hours.trim())   e.hours   = 'Operating hours summary is required.';
    if (form.lat !== '' && isNaN(Number(form.lat)))  e.lat = 'Latitude must be a valid number.';
    if (form.lng !== '' && isNaN(Number(form.lng)))  e.lng = 'Longitude must be a valid number.';
    return e;
  };

  /* ── Submit ────────────────────────────────────────────────────────────── */

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        address:     form.address.trim(),
        city:        form.city.trim(),
        phone:       form.phone.trim(),
        email:       form.email.trim(),
        website:     form.website.trim() || null,
        hours:       form.hours.trim(),
        isEmergency: form.isEmergency,
        species:     form.species,
        services:    form.services,
        lat:         form.lat !== '' ? Number(form.lat) : '',
        lng:         form.lng !== '' ? Number(form.lng) : '',
      };
      if (isEdit && clinicId) {
        await apiPut<Clinic>(`/clinics/${clinicId}`, payload);
      } else {
        await apiPost<Clinic>('/clinics', payload);
      }
      onNavigate('manage-clinic');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save clinic.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / error ───────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading clinic...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError}</p>
          <button
            onClick={() => onNavigate('manage-clinic')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            Back to Clinic List
          </button>
        </div>
      </div>
    );
  }

  /* ── Reusable field ────────────────────────────────────────────────────── */

  const Field = ({
    label, required, error, children,
  }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );

  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
      hasError ? 'border-destructive' : 'border-border'
    }`;

  /* ── Form ──────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <button
          onClick={() => onNavigate('manage-clinic')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clinic List
        </button>

        <h1 className="mb-6">{isEdit ? 'Edit Clinic' : 'Add Clinic'}</h1>

        <div className="space-y-6">

          {/* ── Clinic Details ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-4">Clinic Details</h3>
            <div className="space-y-4">

              <Field label="Clinic Name" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Kuching Emergency Veterinary Centre"
                  className={inputClass(!!errors.name)}
                />
              </Field>

              <Field label="Address" required error={errors.address}>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="e.g. Jalan Tun Jugah"
                  className={inputClass(!!errors.address)}
                />
              </Field>

              <Field label="City" required error={errors.city}>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                  placeholder="e.g. Kuching, Sarawak 93350"
                  className={inputClass(!!errors.city)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone" required error={errors.phone}>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="+60 82-555 100"
                    className={inputClass(!!errors.phone)}
                  />
                </Field>

                <Field label="Email" required error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="clinic@example.my"
                    className={inputClass(!!errors.email)}
                  />
                </Field>
              </div>

              <Field label="Website" error={errors.website}>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="www.example.my (optional)"
                  className={inputClass()}
                />
              </Field>
            </div>
          </div>

          {/* ── Hours & Status ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-4">Hours & Status</h3>
            <div className="space-y-4">

              <Field label="Operating Hours" required error={errors.hours}>
                <input
                  type="text"
                  value={form.hours}
                  onChange={(e) => setField('hours', e.target.value)}
                  placeholder="e.g. Open 24/7  or  Mon–Fri: 9AM–6PM, Sat: 9AM–1PM"
                  className={inputClass(!!errors.hours)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A short summary shown on the clinic card.
                </p>
              </Field>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isEmergency}
                  onChange={(e) => setField('isEmergency', e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <div>
                  <span className="text-sm font-medium">24-hour / Emergency clinic</span>
                  <p className="text-xs text-muted-foreground">
                    Marks this clinic with an emergency badge in the directory.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ── Species Treated ────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-1">Species Treated</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Select all species this clinic accepts.
            </p>
            <div className="flex flex-wrap gap-2">
              {SPECIES_OPTIONS.map((sp) => {
                const selected = form.species.includes(sp);
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => toggleSpecies(sp)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary hover:bg-muted'
                    }`}
                  >
                    {sp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Services ───────────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-1">Services Offered</h3>
            <p className="text-xs text-muted-foreground mb-4">
              List the services this clinic provides (e.g. Emergency Care, Dental Care, Surgery).
            </p>

            {form.services.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.services.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeService(item)}
                      className="hover:text-destructive transition-colors"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addService(); } }}
                placeholder="e.g. Emergency Care, X-Ray, Grooming"
                className="flex-1 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addService}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Press Enter or click Add.</p>
          </div>

          {/* ── GPS Coordinates ────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="mb-1">GPS Coordinates <span className="text-muted-foreground text-sm font-normal">(Optional)</span></h3>
            <p className="text-xs text-muted-foreground mb-4">
              Required for the "Find nearby clinics" feature. Leave blank if unknown.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" error={errors.lat}>
                <input
                  type="text"
                  value={form.lat}
                  onChange={(e) => setField('lat', e.target.value)}
                  placeholder="e.g. 1.5261"
                  className={inputClass(!!errors.lat)}
                />
              </Field>
              <Field label="Longitude" error={errors.lng}>
                <input
                  type="text"
                  value={form.lng}
                  onChange={(e) => setField('lng', e.target.value)}
                  placeholder="e.g. 110.3593"
                  className={inputClass(!!errors.lng)}
                />
              </Field>
            </div>
          </div>

          {/* ── Actions ────────────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onNavigate('manage-clinic')}
              disabled={saving}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Clinic'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
