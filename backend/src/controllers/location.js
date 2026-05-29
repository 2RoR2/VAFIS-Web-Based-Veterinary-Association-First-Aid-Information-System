import crypto from 'node:crypto';
import { ClinicDirectory } from '../repositories/ClinicDirectory.js';

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (Buffer.isBuffer(value)) return JSON.parse(value.toString('utf8')) ?? fallback;
  if (typeof value === 'string') return JSON.parse(value) ?? fallback;
  return value ?? fallback;
};

const mapClinic = (row) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  city: row.city,
  phone: row.phone,
  email: row.email,
  website: row.website,
  hours: row.hours,
  hoursDetail: parseJson(row.hoursDetail, {}),
  distance: row.distance,
  isOpen: Boolean(row.isOpen),
  isEmergency: Boolean(row.isEmergency),
  services: parseJson(row.services, []),
  species: parseJson(row.species, []),
  rating: Number(row.rating ?? 0),
  reviews: Number(row.reviews ?? 0),
  lat: row.lat === null || row.lat === undefined ? undefined : Number(row.lat),
  lng: row.lng === null || row.lng === undefined ? undefined : Number(row.lng),
});

// ── GET /api/clinics ──────────────────────────────────────────────────────────
// Query params (all optional):
//   q         — text search across name, address, city
//   emergency — "true" → only 24/7 emergency clinics
//   open      — "true" → only currently open clinics
//   species   — e.g. "Dogs" → only clinics that treat this species

export const getClinics = (pool) => async (req, res) => {
  const clinicDirectory = new ClinicDirectory(pool);
  const { emergency, open, species, q } = req.query;

  const conditions = [];
  const params = [];

  if (emergency === 'true') conditions.push('isEmergency = 1');
  if (open === 'true') conditions.push('isOpen = 1');
  if (species?.trim()) {
    conditions.push('species LIKE ?');
    params.push(`%"${species.trim()}"%`);
  }
  if (q?.trim()) {
    conditions.push('(LOWER(name) LIKE ? OR LOWER(address) LIKE ? OR LOWER(city) LIKE ?)');
    const term = `%${q.trim().toLowerCase()}%`;
    params.push(term, term, term);
  }

  const rows = await clinicDirectory.findAll({ conditions, params });
  res.json(rows.map(mapClinic));
};

// ── GET /api/clinics/:id ──────────────────────────────────────────────────────

export const getClinicById = (pool) => async (req, res) => {
  const clinicDirectory = new ClinicDirectory(pool);
  const clinic = await clinicDirectory.findById(req.params.id);
  if (!clinic) { res.status(404).json({ error: 'Clinic not found.' }); return; }
  res.json(mapClinic(clinic));
};

// ── POST /api/clinics ─────────────────────────────────────────────────────────

export const createClinic = (pool) => async (req, res) => {
  const clinicDirectory = new ClinicDirectory(pool);
  const { name, address, city, phone, email, website, hours, isEmergency, species, services, lat, lng } = req.body ?? {};

  if (!name?.trim() || !address?.trim() || !city?.trim() || !phone?.trim() || !email?.trim() || !hours?.trim()) {
    res.status(400).json({ error: 'Missing required fields: name, address, city, phone, email, hours.' });
    return;
  }

  const id = `clinic-${crypto.randomUUID().slice(0, 8)}`;

  const created = await clinicDirectory.create({
    id,
    name:        name.trim(),
    address:     address.trim(),
    city:        city.trim(),
    phone:       phone.trim(),
    email:       email.trim(),
    website:     website?.trim() || null,
    hours:       hours.trim(),
    isEmergency: isEmergency ? 1 : 0,
    services:    JSON.stringify(Array.isArray(services) ? services : []),
    species:     JSON.stringify(Array.isArray(species) ? species : []),
    lat:         (lat !== undefined && lat !== '' && lat !== null) ? Number(lat) : null,
    lng:         (lng !== undefined && lng !== '' && lng !== null) ? Number(lng) : null,
  });

  res.status(201).json(mapClinic(created));
};

// ── PUT /api/clinics/:id ──────────────────────────────────────────────────────

export const updateClinic = (pool) => async (req, res) => {
  const clinicDirectory = new ClinicDirectory(pool);
  const existing = await clinicDirectory.findById(req.params.id);
  if (!existing) { res.status(404).json({ error: 'Clinic not found.' }); return; }

  const { name, address, city, phone, email, website, hours, isEmergency, species, services, lat, lng } = req.body ?? {};

  const newLat = (lat !== undefined && lat !== '' && lat !== null) ? Number(lat) : (lat === '' ? null : existing.lat);
  const newLng = (lng !== undefined && lng !== '' && lng !== null) ? Number(lng) : (lng === '' ? null : existing.lng);

  const updated = await clinicDirectory.update(req.params.id, {
    name:        name?.trim()    ?? existing.name,
    address:     address?.trim() ?? existing.address,
    city:        city?.trim()    ?? existing.city,
    phone:       phone?.trim()   ?? existing.phone,
    email:       email?.trim()   ?? existing.email,
    website:     website !== undefined ? (website?.trim() || null) : existing.website,
    hours:       hours?.trim()   ?? existing.hours,
    isEmergency: isEmergency !== undefined ? (isEmergency ? 1 : 0) : existing.isEmergency,
    services:    Array.isArray(services) ? JSON.stringify(services) : existing.services,
    species:     Array.isArray(species)  ? JSON.stringify(species)  : existing.species,
    lat:         newLat,
    lng:         newLng,
  });

  res.json(mapClinic(updated));
};

// ── DELETE /api/clinics/:id ───────────────────────────────────────────────────

export const deleteClinic = (pool) => async (req, res) => {
  const clinicDirectory = new ClinicDirectory(pool);
  const clinic = await clinicDirectory.findById(req.params.id);
  if (!clinic) { res.status(404).json({ error: 'Clinic not found.' }); return; }
  await clinicDirectory.delete(req.params.id);
  res.json({ message: 'Clinic deleted.' });
};

// ── GET /api/clinics/emergency-contacts ──────────────────────────────────────

export const getEmergencyContacts = (pool) => async (_req, res) => {
  const clinicDirectory = new ClinicDirectory(pool);
  const rows = await clinicDirectory.findEmergencyContacts();
  res.json(rows);
};

// ── GET /api/clinics/nearby ──────────────────────────────────────────────────
// Required query params: lat, lng (user's GPS coordinates)
// Optional:  emergency, open, species  (same as getClinics)
// Returns clinics sorted by Haversine distance (distanceKm field added to each)

export const getNearbyClinics = (pool) => async (req, res) => {
  const clinicDirectory = new ClinicDirectory(pool);
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (!isFinite(lat) || !isFinite(lng)) {
    res.status(400).json({ error: 'Query params lat and lng are required numeric values.' });
    return;
  }

  const { emergency, open, species } = req.query;

  const conditions = [];
  const params = [];

  if (emergency === 'true') conditions.push('isEmergency = 1');
  if (open === 'true') conditions.push('isOpen = 1');
  if (species?.trim()) {
    conditions.push('species LIKE ?');
    params.push(`%"${species.trim()}"%`);
  }

  const rows = await clinicDirectory.findNearby({ lat, lng, conditions, params });
  res.json(
    rows.map((row) => ({
      ...mapClinic(row),
      distanceKm: Number(row.distanceKm ?? 0),
    })),
  );
};
