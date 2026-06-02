import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createScenario,
  deleteScenario,
  getScenarioById,
  getScenarios,
  updateScenario,
} from '../controllers/scenarios.js';

// Wraps an async route handler to forward any unhandled promise rejections to Express's error handler.
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Builds and returns an Express router with all emergency scenario routes registered.
export const createScenariosRouter = (pool) => {
  const router = Router();

  router.get('/',    asyncHandler(getScenarios(pool)));
  router.get('/:id', asyncHandler(getScenarioById(pool)));
  router.post('/',   requireAuth, requireRole('admin'), asyncHandler(createScenario(pool)));
  router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(updateScenario(pool)));
  router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteScenario(pool)));

  return router;
};
