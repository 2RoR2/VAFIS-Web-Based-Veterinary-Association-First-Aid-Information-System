import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createVet, getVetById, listVets, toggleSuspend } from '../controllers/admin.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const adminOnly = [requireAuth, requireRole('admin')];

export const createAdminRouter = (pool) => {
  const router = Router();

  router.get('/vets',              ...adminOnly, asyncHandler(listVets(pool)));
  router.get('/vets/:id',          ...adminOnly, asyncHandler(getVetById(pool)));
  router.post('/vets',             ...adminOnly, asyncHandler(createVet(pool)));
  router.put('/vets/:id/suspend',  ...adminOnly, asyncHandler(toggleSuspend(pool)));

  return router;
};
