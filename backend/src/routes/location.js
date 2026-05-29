import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
  getEmergencyContacts,
  getNearbyClinics,
} from '../controllers/location.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createLocationRouter = (pool) => {
  const router = Router();

  // Specific named routes MUST come before /:id to avoid route conflicts
  router.get('/emergency-contacts', asyncHandler(getEmergencyContacts(pool)));
  router.get('/nearby',             asyncHandler(getNearbyClinics(pool)));
  router.get('/',                   asyncHandler(getClinics(pool)));

  // Admin CRUD
  router.get('/:id',    asyncHandler(getClinicById(pool)));
  router.post('/',      requireAuth, requireRole('admin'), asyncHandler(createClinic(pool)));
  router.put('/:id',    requireAuth, requireRole('admin'), asyncHandler(updateClinic(pool)));
  router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteClinic(pool)));

  return router;
};
