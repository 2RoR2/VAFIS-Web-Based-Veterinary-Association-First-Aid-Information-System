import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { changePassword, updateProfile } from '../controllers/user.js';

// Wraps an async route handler to forward any unhandled promise rejections to Express's error handler.
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Builds and returns an Express router with all user profile and password routes registered.
export const createUserRouter = (pool) => {
  const router = Router();

  router.put('/profile', requireAuth, asyncHandler(updateProfile(pool)));
  router.put('/password', requireAuth, asyncHandler(changePassword(pool)));

  return router;
};
