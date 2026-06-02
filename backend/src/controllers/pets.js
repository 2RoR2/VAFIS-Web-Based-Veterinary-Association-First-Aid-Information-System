import crypto from 'node:crypto';

const mapPet = (row) => ({
  id: row.id,
  name: row.name,
  species: row.species,
  age: row.age,
  createdAt: row.createdAt ?? null,
  updatedAt: row.updatedAt ?? null,
});

// All pets for the current user
export const getPets = (pool) => async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM pets WHERE userId = ? ORDER BY createdAt ASC',
    [req.user.id],
  );
  res.json(rows.map(mapPet));
};

// Create a pet
export const createPet = (pool) => async (req, res) => {
  const { name, species, age } = req.body ?? {};

  if (!name?.trim() || !species?.trim()) {
    res.status(400).json({ error: 'name and species are required.' });
    return;
  }

  const id = crypto.randomUUID();
  await pool.execute(
    'INSERT INTO pets (id, userId, name, species, age) VALUES (?, ?, ?, ?, ?)',
    [id, req.user.id, name.trim(), species.trim(), age?.trim() ?? ''],
  );

  const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [id]);
  res.status(201).json(mapPet(rows[0]));
};

// Update a pet
export const updatePet = (pool) => async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM pets WHERE id = ? AND userId = ?',
    [req.params.id, req.user.id],
  );
  const pet = rows[0];
  if (!pet) {
    res.status(404).json({ error: 'Pet not found.' });
    return;
  }

  const { name, species, age } = req.body ?? {};
  await pool.execute(
    'UPDATE pets SET name = ?, species = ?, age = ? WHERE id = ?',
    [
      name?.trim() ?? pet.name,
      species?.trim() ?? pet.species,
      age?.trim() ?? pet.age,
      req.params.id,
    ],
  );

  const [updated] = await pool.query('SELECT * FROM pets WHERE id = ?', [req.params.id]);
  res.json(mapPet(updated[0]));
};

// Delete a pet
export const deletePet = (pool) => async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id FROM pets WHERE id = ? AND userId = ?',
    [req.params.id, req.user.id],
  );
  if (!rows[0]) {
    res.status(404).json({ error: 'Pet not found.' });
    return;
  }

  await pool.execute('DELETE FROM pets WHERE id = ?', [req.params.id]);
  res.json({ message: 'Pet deleted.' });
};
