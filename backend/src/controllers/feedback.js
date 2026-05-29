import crypto from 'node:crypto';

// ── GET /api/feedback ─────────────────────────────────────────────────────────
// Admin / professional only — see all submitted feedback, newest first.

export const getFeedback = (pool) => async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM feedback ORDER BY submittedAt DESC');
  res.json(rows);
};

// ── POST /api/feedback ────────────────────────────────────────────────────────
// Authenticated users only.
// submittedBy is taken from req.user.fullName (set by requireAuth middleware).

export const submitFeedback = (pool) => async (req, res) => {
  const { contentType, contentTitle, rating, comment } = req.body ?? {};
  const numericRating = Number(rating);

  if (!contentType || !contentTitle?.trim()) {
    res.status(400).json({ error: 'contentType and contentTitle are required.' });
    return;
  }

  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    res.status(400).json({ error: 'rating must be a number between 1 and 5.' });
    return;
  }

  const feedbackId = `fb-${crypto.randomUUID()}`;
  const submittedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const submittedBy = req.user.fullName;
  const status = 'New';

  await pool.execute(
    `INSERT INTO feedback (id, contentType, contentTitle, rating, comment, submittedBy, status, submittedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      feedbackId,
      contentType,
      contentTitle.trim(),
      numericRating,
      comment?.trim() ?? '',
      submittedBy,
      status,
      submittedAt,
    ],
  );

  res.status(201).json({
    id: feedbackId,
    contentType,
    contentTitle: contentTitle.trim(),
    rating: numericRating,
    comment: comment?.trim() ?? '',
    submittedBy,
    status,
    submittedAt,
  });
};

// ── PUT /api/feedback/:id/status ──────────────────────────────────────────────
// Admin only — update the review status of a feedback item.

export const updateFeedbackStatus = (pool) => async (req, res) => {
  const { status } = req.body ?? {};
  const VALID = ['New', 'Reviewed', 'Action Needed'];

  if (!VALID.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${VALID.join(', ')}.` });
    return;
  }

  const [rows] = await pool.query('SELECT * FROM feedback WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Feedback not found.' }); return; }

  await pool.execute('UPDATE feedback SET status = ? WHERE id = ?', [status, req.params.id]);

  const [updated] = await pool.query('SELECT * FROM feedback WHERE id = ?', [req.params.id]);
  res.json(updated[0]);
};
