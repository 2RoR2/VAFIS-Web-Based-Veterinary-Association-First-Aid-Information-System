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

// Wraps an async route handler to forward any unhandled promise rejections to Express's error handler.
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Builds and returns an Express router with all clinic/location routes registered.
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
