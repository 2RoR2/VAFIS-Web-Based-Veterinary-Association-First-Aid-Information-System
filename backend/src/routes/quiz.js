import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getQuizzes, getQuizById, submitQuizResult, getMyResults } from '../controllers/quiz.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createQuizRouter = (pool) => {
  const router = Router();

  // Public
  router.get('/', asyncHandler(getQuizzes(pool)));

  // Authenticated — must be before /:id to avoid route conflict
  router.get('/my-results', requireAuth, asyncHandler(getMyResults(pool)));

  // Public
  router.get('/:id', asyncHandler(getQuizById(pool)));

  // Authenticated
  router.post('/:id/results', requireAuth, asyncHandler(submitQuizResult(pool)));

  return router;
};
