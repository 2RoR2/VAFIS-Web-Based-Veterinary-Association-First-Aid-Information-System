import crypto from 'node:crypto';

const mapCategory = (row) => ({
  id:          row.id,
  name:        row.name,
  description: row.description ?? '',
});

export const getCategories = (pool) => async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.json(rows.map(mapCategory));
};

export const getCategoryById = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Category not found.' }); return; }
  res.json(mapCategory(rows[0]));
};

export const createCategory = (pool) => async (req, res) => {
  const { name, description } = req.body ?? {};

  if (!name?.trim()) {
    res.status(400).json({ error: 'Missing required field: name.' });
    return;
  }

  // Check for duplicate name
  const [existing] = await pool.query('SELECT id FROM categories WHERE name = ?', [name.trim()]);
  if (existing.length > 0) {
    res.status(409).json({ error: 'A category with this name already exists.' });
    return;
  }

  const id = `cat-${crypto.randomUUID().slice(0, 8)}`;

  await pool.execute(
    `INSERT INTO categories (id, name, description) VALUES (?, ?, ?)`,
    [id, name.trim(), description?.trim() ?? ''],
  );

  const [created] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  res.status(201).json(mapCategory(created[0]));
};

export const updateCategory = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  const existing = rows[0];
  if (!existing) { res.status(404).json({ error: 'Category not found.' }); return; }

  const { name, description } = req.body ?? {};
  const newName = name?.trim() ?? existing.name;

  // Check for duplicate name (excluding current record)
  if (newName !== existing.name) {
    const [dup] = await pool.query('SELECT id FROM categories WHERE name = ? AND id != ?', [newName, req.params.id]);
    if (dup.length > 0) {
      res.status(409).json({ error: 'A category with this name already exists.' });
      return;
    }
  }

  await pool.execute(
    `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
    [
      newName,
      description !== undefined ? description.trim() : existing.description,
      req.params.id,
    ],
  );

  const [updated] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  res.json(mapCategory(updated[0]));
};

export const deleteCategory = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Category not found.' }); return; }
  await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ message: 'Category deleted.' });
};
