import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createScenario,
  deleteScenario,
  getScenarioById,
  getScenarios,
  updateScenario,
} from '../controllers/scenarios.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createScenariosRouter = (pool) => {
  const router = Router();

  router.get('/',    asyncHandler(getScenarios(pool)));
  router.get('/:id', asyncHandler(getScenarioById(pool)));
  router.post('/',   requireAuth, requireRole('admin'), asyncHandler(createScenario(pool)));
  router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(updateScenario(pool)));
  router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteScenario(pool)));

  return router;
};
