import { Router } from 'express';
import { getClinics, getEmergencyContacts, getNearbyClinics } from '../controllers/location.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createLocationRouter = (pool) => {
  const router = Router();

  // Specific routes MUST be registered before any potential /:id route
  router.get('/emergency-contacts', asyncHandler(getEmergencyContacts(pool)));
  router.get('/nearby', asyncHandler(getNearbyClinics(pool)));
  router.get('/', asyncHandler(getClinics(pool)));

  return router;
};
