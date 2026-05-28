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
