import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
// @ts-ignore — JS module resolved by tsx at runtime
import { createAuthRouter } from '../backend/src/routes/auth.js';
// @ts-ignore
import { createGuidesRouter } from '../backend/src/routes/guides.js';
// @ts-ignore
import { createQuizRouter } from '../backend/src/routes/quiz.js';
// @ts-ignore
import { createLocationRouter } from '../backend/src/routes/location.js';
// @ts-ignore
import { createFeedbackRouter } from '../backend/src/routes/feedback.js';
// @ts-ignore
import { createUserRouter } from '../backend/src/routes/user.js';
// @ts-ignore
import { createVideosRouter } from '../backend/src/routes/videos.js';
// @ts-ignore
import { createPetsRouter } from '../backend/src/routes/pets.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
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

const asyncHandler = (handler: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    handler(req, res, next).catch(next);
  };

app.use('/api/auth', createAuthRouter(pool));
app.use('/api/guides', createGuidesRouter(pool));
app.use('/api/quizzes', createQuizRouter(pool));
app.use('/api/clinics', createLocationRouter(pool));
app.use('/api/feedback', createFeedbackRouter(pool));
app.use('/api/user', createUserRouter(pool));
app.use('/api/videos', createVideosRouter(pool));
app.use('/api/pets', createPetsRouter(pool));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

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
