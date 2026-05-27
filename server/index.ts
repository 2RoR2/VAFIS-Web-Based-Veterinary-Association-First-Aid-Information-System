import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import crypto from 'node:crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'vafis',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
});

const parseJson = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (Buffer.isBuffer(value)) {
    const parsed = JSON.parse(value.toString('utf8')) as T | null;
    return parsed ?? fallback;
  }
  if (typeof value === 'string') {
    const parsed = JSON.parse(value) as T | null;
    return parsed ?? fallback;
  }
  return (value as T) ?? fallback;
};

const asyncHandler = (handler: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    handler(req, res, next).catch(next);
  };

const mapGuide = (row: any) => ({
  id: row.id,
  title: row.title,
  species: parseJson<string[]>(row.species, []),
  severity: row.severity,
  readTime: row.readTime,
  description: row.description,
  category: row.category,
  lastReviewed: row.lastReviewed,
  reviewedBy: row.reviewedBy,
  steps: parseJson(row.steps, []),
  warnings: parseJson<string[]>(row.warnings, []),
  relatedVideos: parseJson<string[]>(row.relatedVideos, []),
  relatedGuides: parseJson<string[]>(row.relatedGuides, []),
});

const mapVideo = (row: any) => ({
  id: row.id,
  title: row.title,
  duration: row.duration,
  species: row.species,
  category: row.category,
  description: row.description,
  thumbnail: row.thumbnail,
  instructor: row.instructor,
  difficulty: row.difficulty,
  views: Number(row.views ?? 0),
});

const mapQuiz = (row: any) => ({
  id: row.id,
  title: row.title,
  species: row.species,
  category: row.category,
  difficulty: row.difficulty,
  passingScore: Number(row.passingScore ?? 0),
  questions: parseJson(row.questions, []),
  description: row.description,
});

const mapClinic = (row: any) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  city: row.city,
  phone: row.phone,
  email: row.email,
  website: row.website,
  hours: row.hours,
  hoursDetail: parseJson<Record<string, string>>(row.hoursDetail, {}),
  distance: row.distance,
  isOpen: Boolean(row.isOpen),
  isEmergency: Boolean(row.isEmergency),
  services: parseJson<string[]>(row.services, []),
  species: parseJson<string[]>(row.species, []),
  rating: Number(row.rating ?? 0),
  reviews: Number(row.reviews ?? 0),
  lat: row.lat === null ? undefined : Number(row.lat),
  lng: row.lng === null ? undefined : Number(row.lng),
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/guides', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides');
  res.json((rows as any[]).map(mapGuide));
}));

app.get('/api/guides/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [req.params.id]);
  const guide = (rows as any[])[0];

  if (!guide) {
    res.status(404).json({ error: 'Guide not found' });
    return;
  }

  res.json(mapGuide(guide));
}));

app.get('/api/videos', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM videos');
  res.json((rows as any[]).map(mapVideo));
}));

app.get('/api/quizzes', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM quizzes');
  res.json((rows as any[]).map(mapQuiz));
}));

app.get('/api/clinics', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM clinics');
  res.json((rows as any[]).map(mapClinic));
}));

app.get('/api/clinics/emergency-contacts', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM emergency_contacts');
  res.json(rows);
}));

app.get('/api/feedback', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM feedback ORDER BY submittedAt DESC');
  res.json(rows);
}));

app.post('/api/feedback', asyncHandler(async (req, res) => {
  const { contentType, contentTitle, rating, comment, submittedBy } = req.body ?? {};
  const numericRating = Number(rating);

  if (!contentType || !contentTitle || !Number.isFinite(numericRating) || numericRating <= 0) {
    res.status(400).json({ error: 'Invalid feedback payload.' });
    return;
  }

  const feedbackId = `fb-${crypto.randomUUID()}`;
  const submittedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const status = 'New';

  await pool.execute(
    'INSERT INTO feedback (id, contentType, contentTitle, rating, comment, submittedBy, status, submittedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [feedbackId, contentType, contentTitle, numericRating, comment ?? '', submittedBy ?? 'Pet Owner', status, submittedAt],
  );

  res.status(201).json({
    id: feedbackId,
    contentType,
    contentTitle,
    rating: numericRating,
    comment: comment ?? '',
    submittedBy: submittedBy ?? 'Pet Owner',
    status,
    submittedAt,
  });
}));

app.get('/api/workflow/notifications', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM notifications');
  res.json(rows);
}));

app.get('/api/workflow/audit-logs', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM audit_logs');
  res.json(rows);
}));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.API_PORT ?? 4000);
app.listen(port, () => {
  console.log(`VAFIS API listening on port ${port}`);
});
