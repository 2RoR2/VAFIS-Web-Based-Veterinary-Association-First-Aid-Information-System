import crypto from 'node:crypto';
import { GuideRepository, mapGuide } from '../repositories/GuideRepository.js';

const logAudit = (pool, actor, action, target) =>
  pool.execute(
    'INSERT INTO audit_logs (id, actor, action, target, timestamp) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), actor, action, target, new Date().toISOString()],
  );

const notify = (pool, audience, event) =>
  pool.execute(
    'INSERT INTO notifications (id, audience, event, status, timestamp) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), audience, event, 'unread', new Date().toISOString()],
  );

// ── Search strategies (Strategy pattern) ────────────────────────────────────

const keywordStrategy = (q) => ({
  sql: '(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)',
  params: [`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`],
});

const speciesStrategy = (species) => ({
  // species column is a JSON array e.g. ["Dogs","Cats"] — match the quoted element
  sql: 'species LIKE ?',
  params: [`%"${species}"%`],
});

const categoryStrategy = (category) => ({
  sql: 'category = ?',
  params: [category],
});

const severityStrategy = (severity) => ({
  sql: 'severity = ?',
  params: [severity],
});

export const searchGuides = (pool) => async (req, res) => {
  const { q, species, category, severity } = req.query;

  // Select which strategies to apply based on provided query params
  const strategies = [];
  if (q?.trim())      strategies.push(keywordStrategy(q.trim()));
  if (species?.trim()) strategies.push(speciesStrategy(species.trim()));
  if (category?.trim()) strategies.push(categoryStrategy(category.trim()));
  if (severity?.trim()) strategies.push(severityStrategy(severity.trim()));

  // Build WHERE clause: always filter by published + any active strategies
  const conditions = ["status = 'published'", ...strategies.map((s) => s.sql)];
  const params     = strategies.flatMap((s) => s.params);

  const sql = `SELECT * FROM guides WHERE ${conditions.join(' AND ')} ORDER BY publishedAt DESC`;
  const [rows] = await pool.query(sql, params);
  res.json(rows.map(mapGuide));
};

// ── Public ──────────────────────────────────────────────────────────────────

export const getPublishedGuides = (pool) => async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE status = ?', ['published']);
  res.json(rows.map(mapGuide));
};

export const getAdminGuides = (pool) => async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides ORDER BY updatedAt DESC, id ASC');
  res.json(rows.map(mapGuide));
};

export const getPendingReviewGuides = (pool) => async (req, res) => {
  const repository = new GuideRepository(pool);
  const guides = await repository.findPendingReviews(req.user.id);
  res.json(guides);
};

export const getGuideById = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  const guide = rows[0];

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  const role = req.user?.role;
  if (guide.status !== 'published' && role !== 'admin' && role !== 'professional') {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  res.json(mapGuide(guide));
};

// ── Admin CRUD ───────────────────────────────────────────────────────────────

export const createGuide = (pool) => async (req, res) => {
  const { title, species, severity, readTime, description, category, steps, warnings, relatedVideos, relatedGuides } = req.body ?? {};

  if (!title || !species || !severity || !readTime || !description || !category || !steps) {
    res.status(400).json({ error: 'Missing required fields: title, species, severity, readTime, description, category, steps.' });
    return;
  }

  const id = `guide-${crypto.randomUUID().slice(0, 8)}`;

  await pool.execute(
    `INSERT INTO guides
       (id, status, title, species, severity, readTime, description, category,
        lastReviewed, reviewedBy, steps, warnings, relatedVideos, relatedGuides, createdBy)
     VALUES (?, 'draft', ?, ?, ?, ?, ?, ?, '', '', ?, ?, ?, ?, ?)`,
    [
      id,
      title,
      JSON.stringify(Array.isArray(species) ? species : [species]),
      severity,
      readTime,
      description,
      category,
      JSON.stringify(steps),
      JSON.stringify(warnings ?? []),
      JSON.stringify(relatedVideos ?? []),
      JSON.stringify(relatedGuides ?? []),
      req.user.id,
    ],
  );

  await logAudit(pool, req.user.email, 'GUIDE_CREATED', title);

  const [created] = await pool.query('SELECT * FROM guides WHERE id = ?', [id]);
  res.status(201).json(mapGuide(created[0]));
};

export const updateGuide = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  const guide = rows[0];

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (!['draft', 'revision_required'].includes(guide.status)) {
    res.status(409).json({ error: `Guide cannot be edited while in '${guide.status}' status.` });
    return;
  }

  const { title, species, severity, readTime, description, category, steps, warnings, relatedVideos, relatedGuides } = req.body ?? {};

  await pool.execute(
    `UPDATE guides SET
       title         = COALESCE(?, title),
       species       = COALESCE(?, species),
       severity      = COALESCE(?, severity),
       readTime      = COALESCE(?, readTime),
       description   = COALESCE(?, description),
       category      = COALESCE(?, category),
       steps         = COALESCE(?, steps),
       warnings      = COALESCE(?, warnings),
       relatedVideos = COALESCE(?, relatedVideos),
       relatedGuides = COALESCE(?, relatedGuides)
     WHERE id = ?`,
    [
      title ?? null,
      species ? JSON.stringify(Array.isArray(species) ? species : [species]) : null,
      severity ?? null,
      readTime ?? null,
      description ?? null,
      category ?? null,
      steps ? JSON.stringify(steps) : null,
      warnings ? JSON.stringify(warnings) : null,
      relatedVideos ? JSON.stringify(relatedVideos) : null,
      relatedGuides ? JSON.stringify(relatedGuides) : null,
      req.params.id,
    ],
  );

  await logAudit(pool, req.user.email, 'GUIDE_UPDATED', guide.title);

  const [updated] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  res.json(mapGuide(updated[0]));
};

export const deleteGuide = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  const guide = rows[0];

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  await pool.execute('DELETE FROM guides WHERE id = ?', [req.params.id]);
  await logAudit(pool, req.user.email, 'GUIDE_DELETED', guide.title);

  res.json({ message: 'Guide deleted.' });
};

// ── Workflow transitions ─────────────────────────────────────────────────────

export const submitForReview = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  const guide = rows[0];

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (!['draft', 'revision_required'].includes(guide.status)) {
    res.status(409).json({ error: `Guide cannot be submitted for review from '${guide.status}' status.` });
    return;
  }

  const { assignedVetId } = req.body ?? {};

  await pool.execute(
    `UPDATE guides SET status = 'pending_review', assignedVetId = ?, submittedAt = NOW(), reviewComments = NULL WHERE id = ?`,
    [assignedVetId ?? null, req.params.id],
  );

  // Resolve vet audience for notification
  let audience = 'Veterinary Professional';
  if (assignedVetId) {
    const [vetRows] = await pool.query('SELECT email FROM users WHERE id = ?', [assignedVetId]);
    if (vetRows[0]) audience = vetRows[0].email;
  }

  await logAudit(pool, req.user.email, 'GUIDE_SUBMITTED_FOR_REVIEW', guide.title);
  await notify(pool, audience, `Guide "${guide.title}" is pending your clinical review.`);

  const [updated] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  res.json(mapGuide(updated[0]));
};

export const reviewGuide = (pool) => async (req, res) => {
  const repository = new GuideRepository(pool);
  const guide = await repository.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (guide.status !== 'pending_review') {
    res.status(409).json({ error: 'Guide is not pending review.' });
    return;
  }

  const { action, comments } = req.body ?? {};

  if (!['approve', 'request_changes'].includes(action)) {
    res.status(400).json({ error: 'action must be "approve" or "request_changes".' });
    return;
  }

  if (action === 'request_changes' && !comments?.trim()) {
    res.status(400).json({ error: 'comments are required when requesting changes.' });
    return;
  }

  let updatedGuide;

  if (action === 'approve') {
    updatedGuide = await repository.markApproved(req.params.id, req.user.fullName ?? req.user.email);
    await notify(pool, 'Administrator', `Guide "${guide.title}" passed clinical review and is ready to publish.`);
    await logAudit(pool, req.user.email, 'GUIDE_REVIEW_APPROVED', guide.title);
  } else {
    updatedGuide = await repository.markRevisionRequired(req.params.id, comments.trim());
    await notify(pool, 'Administrator', `Guide "${guide.title}" requires revisions: ${comments.trim()}`);
    await logAudit(pool, req.user.email, 'GUIDE_REVIEW_CHANGES_REQUESTED', guide.title);
  }

  res.json(updatedGuide);
};

export const publishGuide = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  const guide = rows[0];

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (guide.status !== 'reviewed') {
    res.status(409).json({ error: `Guide must be in 'reviewed' status to publish. Current: '${guide.status}'.` });
    return;
  }

  await pool.execute(
    `UPDATE guides SET status = 'published', publishedAt = NOW() WHERE id = ?`,
    [req.params.id],
  );

  await logAudit(pool, req.user.email, 'GUIDE_PUBLISHED', guide.title);

  const [updated] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  res.json(mapGuide(updated[0]));
};

export const archiveGuide = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  const guide = rows[0];

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (guide.status === 'archived') {
    res.status(409).json({ error: 'Guide is already archived.' });
    return;
  }

  if (guide.status === 'pending_review') {
    res.status(409).json({ error: 'Cannot archive a guide that is pending review.' });
    return;
  }

  await pool.execute(`UPDATE guides SET status = 'archived' WHERE id = ?`, [req.params.id]);
  await logAudit(pool, req.user.email, 'GUIDE_ARCHIVED', guide.title);

  const [updated] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  res.json(mapGuide(updated[0]));
};

export const unpublishGuide = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  const guide = rows[0];

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (guide.status !== 'published') {
    res.status(409).json({ error: 'Only published guides can be unpublished.' });
    return;
  }

  await pool.execute(`UPDATE guides SET status = 'draft' WHERE id = ?`, [req.params.id]);
  await logAudit(pool, req.user.email, 'GUIDE_UNPUBLISHED', guide.title);

  const [updated] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  res.json(mapGuide(updated[0]));
};
