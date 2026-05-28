import crypto from 'node:crypto';

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (Buffer.isBuffer(value)) return JSON.parse(value.toString('utf8')) ?? fallback;
  if (typeof value === 'string') return JSON.parse(value) ?? fallback;
  return value ?? fallback;
};

const mapQuiz = (row) => ({
  id: row.id,
  title: row.title,
  species: row.species,
  category: row.category,
  difficulty: row.difficulty,
  passingScore: Number(row.passingScore ?? 0),
  questions: parseJson(row.questions, []),
  description: row.description,
});

const mapResult = (row) => ({
  id: row.id,
  quizId: row.quizId,
  quizTitle: row.quizTitle ?? null,
  score: Number(row.score),
  totalQuestions: Number(row.totalQuestions),
  percentage: Number(row.percentage),
  passed: Boolean(row.passed),
  attemptDate: row.attemptDate,
});

// ── Public ───────────────────────────────────────────────────────────────────

export const getQuizzes = (pool) => async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM quizzes');
  res.json(rows.map(mapQuiz));
};

export const getQuizById = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Quiz not found.' }); return; }
  res.json(mapQuiz(rows[0]));
};

// ── Authenticated ─────────────────────────────────────────────────────────────

export const submitQuizResult = (pool) => async (req, res) => {
  const { score, totalQuestions, percentage, passed } = req.body ?? {};

  if (score === undefined || !totalQuestions || percentage === undefined || passed === undefined) {
    res.status(400).json({ error: 'Missing required fields: score, totalQuestions, percentage, passed.' });
    return;
  }

  const [quizRows] = await pool.query('SELECT id FROM quizzes WHERE id = ?', [req.params.id]);
  if (!quizRows[0]) { res.status(404).json({ error: 'Quiz not found.' }); return; }

  const id = crypto.randomUUID();
  await pool.execute(
    'INSERT INTO quiz_results (id, quizId, userId, score, totalQuestions, percentage, passed) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.params.id, req.user.id, Number(score), Number(totalQuestions), Number(percentage), passed ? 1 : 0],
  );

  res.status(201).json({
    id,
    quizId: req.params.id,
    userId: req.user.id,
    score: Number(score),
    totalQuestions: Number(totalQuestions),
    percentage: Number(percentage),
    passed: Boolean(passed),
  });
};

export const getMyResults = (pool) => async (req, res) => {
  const [rows] = await pool.query(
    `SELECT qr.*, q.title AS quizTitle
     FROM quiz_results qr
     LEFT JOIN quizzes q ON qr.quizId = q.id
     WHERE qr.userId = ?
     ORDER BY qr.attemptDate DESC
     LIMIT 20`,
    [req.user.id],
  );
  res.json(rows.map(mapResult));
};
