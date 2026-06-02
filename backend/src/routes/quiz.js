import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getQuizzes, getQuizById, submitQuizResult, getMyResults } from '../controllers/quiz.js';

// Wraps an async route handler to forward any unhandled promise rejections to Express's error handler.
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Builds and returns an Express router with all quiz routes registered.
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
