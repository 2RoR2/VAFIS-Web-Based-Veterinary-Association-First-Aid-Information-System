import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { changePassword, updateProfile } from '../controllers/user.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createUserRouter = (pool) => {
  const router = Router();

  router.put('/profile', requireAuth, asyncHandler(updateProfile(pool)));
  router.put('/password', requireAuth, asyncHandler(changePassword(pool)));

  return router;
};
