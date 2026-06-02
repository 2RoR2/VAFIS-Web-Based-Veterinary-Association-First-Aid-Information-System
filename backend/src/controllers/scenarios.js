import crypto from 'node:crypto';

// Maps a database emergency scenario row to the public-facing scenario object.
const mapScenario = (row) => ({
  id:          row.id,
  name:        row.name,
  species:     typeof row.species === 'string' ? JSON.parse(row.species) : row.species,
  severity:    row.severity,
  description: row.description ?? '',
});

// Returns all emergency scenarios ordered alphabetically by name.
export const getScenarios = (pool) => async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM emergency_scenarios ORDER BY name ASC');
  res.json(rows.map(mapScenario));
};

// Returns a single emergency scenario by ID. Responds 404 if not found.
export const getScenarioById = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM emergency_scenarios WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Scenario not found.' }); return; }
  res.json(mapScenario(rows[0]));
};

// Creates a new emergency scenario with name, species array, severity, and optional description.
export const createScenario = (pool) => async (req, res) => {
  const { name, species, severity, description } = req.body ?? {};

  if (!name?.trim()) {
    res.status(400).json({ error: 'Missing required field: name.' });
    return;
  }
  if (!Array.isArray(species) || species.length === 0) {
    res.status(400).json({ error: 'At least one species is required.' });
    return;
  }
  if (!['low', 'medium', 'high'].includes(severity)) {
    res.status(400).json({ error: 'severity must be low, medium, or high.' });
    return;
  }

  const id = `scenario-${crypto.randomUUID().slice(0, 8)}`;

  await pool.execute(
    `INSERT INTO emergency_scenarios (id, name, species, severity, description)
     VALUES (?, ?, ?, ?, ?)`,
    [id, name.trim(), JSON.stringify(species), severity, description?.trim() ?? ''],
  );

  const [created] = await pool.query('SELECT * FROM emergency_scenarios WHERE id = ?', [id]);
  res.status(201).json(mapScenario(created[0]));
};

// Updates an existing emergency scenario's fields. Responds 404 if not found.
export const updateScenario = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM emergency_scenarios WHERE id = ?', [req.params.id]);
  const existing = rows[0];
  if (!existing) { res.status(404).json({ error: 'Scenario not found.' }); return; }

  const { name, species, severity, description } = req.body ?? {};

  const newSpecies = Array.isArray(species) ? JSON.stringify(species) : existing.species;

  await pool.execute(
    `UPDATE emergency_scenarios SET name = ?, species = ?, severity = ?, description = ? WHERE id = ?`,
    [
      name?.trim() ?? existing.name,
      newSpecies,
      ['low', 'medium', 'high'].includes(severity) ? severity : existing.severity,
      description !== undefined ? description.trim() : existing.description,
      req.params.id,
    ],
  );

  const [updated] = await pool.query('SELECT * FROM emergency_scenarios WHERE id = ?', [req.params.id]);
  res.json(mapScenario(updated[0]));
};

// Permanently deletes an emergency scenario. Responds 404 if not found.
export const deleteScenario = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM emergency_scenarios WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Scenario not found.' }); return; }
  await pool.execute('DELETE FROM emergency_scenarios WHERE id = ?', [req.params.id]);
  res.json({ message: 'Scenario deleted.' });
};
