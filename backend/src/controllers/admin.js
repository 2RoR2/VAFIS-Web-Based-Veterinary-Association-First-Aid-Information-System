import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const SALT_ROUNDS = 10;

// Maps a database user row to the public-facing veterinary professional object.
const mapVet = (row) => ({
  id:          row.id,
  fullName:    row.fullName,
  email:       row.email,
  isSuspended: Boolean(row.isSuspended),
  createdAt:   row.createdAt instanceof Date
    ? row.createdAt.toISOString()
    : String(row.createdAt ?? ''),
});

// ── GET /api/admin/vets ───────────────────────────────────────────────────────

// Returns all users with the 'professional' role, ordered alphabetically by name.
export const listVets = (pool) => async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, fullName, email, isSuspended, createdAt
       FROM users WHERE role = 'professional'
       ORDER BY fullName ASC`,
  );
  res.json(rows.map(mapVet));
};

// ── GET /api/admin/vets/:id ───────────────────────────────────────────────────

// Returns a single veterinary professional by their user ID. Responds 404 if not found.
export const getVetById = (pool) => async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, fullName, email, isSuspended, createdAt
       FROM users WHERE id = ? AND role = 'professional'`,
    [req.params.id],
  );
  if (!rows[0]) { res.status(404).json({ error: 'Veterinary professional not found.' }); return; }
  res.json(mapVet(rows[0]));
};

// ── POST /api/admin/vets ──────────────────────────────────────────────────────

/**
 * Creates a new veterinary professional account.
 * Hashes the provided password before storage and rejects duplicate emails.
 */
export const createVet = (pool) => async (req, res) => {
  const { fullName, email, password } = req.body ?? {};

  if (!fullName?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: 'fullName, email, and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (existing[0]) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const id           = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await pool.execute(
    `INSERT INTO users (id, fullName, email, passwordHash, role, isSuspended)
     VALUES (?, ?, ?, ?, 'professional', 0)`,
    [id, fullName.trim(), email.trim().toLowerCase(), passwordHash],
  );

  const [created] = await pool.query(
    `SELECT id, fullName, email, isSuspended, createdAt FROM users WHERE id = ?`,
    [id],
  );
  res.status(201).json(mapVet(created[0]));
};

// ── PUT /api/admin/vets/:id/suspend ──────────────────────────────────────────

/**
 * Toggles the suspended state of a veterinary professional account.
 * Suspended accounts are blocked from logging in.
 */
export const toggleSuspend = (pool) => async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, fullName, email, isSuspended, createdAt
       FROM users WHERE id = ? AND role = 'professional'`,
    [req.params.id],
  );
  const user = rows[0];
  if (!user) { res.status(404).json({ error: 'Veterinary professional not found.' }); return; }

  const newStatus = user.isSuspended ? 0 : 1;
  await pool.execute('UPDATE users SET isSuspended = ? WHERE id = ?', [newStatus, req.params.id]);

  const [updated] = await pool.query(
    `SELECT id, fullName, email, isSuspended, createdAt FROM users WHERE id = ?`,
    [req.params.id],
  );
  res.json(mapVet(updated[0]));
};
