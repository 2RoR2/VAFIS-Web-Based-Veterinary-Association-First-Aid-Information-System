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
  const { emergency, open, species, q } = req.query;

  const conditions = [];
  const params = [];

  if (emergency === 'true') {
    conditions.push('isEmergency = 1');
  }
  if (open === 'true') {
    conditions.push('isOpen = 1');
  }
  if (species?.trim()) {
    conditions.push('species LIKE ?');
    params.push(`%"${species.trim()}"%`);
  }
  if (q?.trim()) {
    conditions.push('(LOWER(name) LIKE ? OR LOWER(address) LIKE ? OR LOWER(city) LIKE ?)');
    const term = `%${q.trim().toLowerCase()}%`;
    params.push(term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT * FROM clinics ${where}`, params);
  res.json(rows.map(mapClinic));
};

// ── GET /api/clinics/emergency-contacts ──────────────────────────────────────

export const getEmergencyContacts = (pool) => async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM emergency_contacts');
  res.json(rows);
};

// ── GET /api/clinics/nearby ──────────────────────────────────────────────────
// Required query params: lat, lng (user's GPS coordinates)
// Optional:  emergency, open, species  (same as getClinics)
// Returns clinics sorted by Haversine distance (distanceKm field added to each)

export const getNearbyClinics = (pool) => async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (!isFinite(lat) || !isFinite(lng)) {
    res.status(400).json({ error: 'Query params lat and lng are required numeric values.' });
    return;
  }

  const { emergency, open, species } = req.query;

  // Base conditions: must have coordinates to compute distance
  const conditions = ['lat IS NOT NULL', 'lng IS NOT NULL'];
  // Haversine params come first (lat, lng, lat — used in SELECT expression)
  const params = [lat, lng, lat];

  if (emergency === 'true') conditions.push('isEmergency = 1');
  if (open === 'true') conditions.push('isOpen = 1');
  if (species?.trim()) {
    conditions.push('species LIKE ?');
    params.push(`%"${species.trim()}"%`);
  }

  const sql = `
    SELECT *,
      ROUND(
        6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(lat)) * COS(RADIANS(lng) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(lat))
        ),
        2
      ) AS distanceKm
    FROM clinics
    WHERE ${conditions.join(' AND ')}
    ORDER BY distanceKm ASC
  `;

  const [rows] = await pool.query(sql, params);
  res.json(
    rows.map((row) => ({
      ...mapClinic(row),
      distanceKm: Number(row.distanceKm ?? 0),
    })),
  );
};
