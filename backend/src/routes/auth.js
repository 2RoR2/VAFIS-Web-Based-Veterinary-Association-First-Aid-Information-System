import { Router } from 'express';
import { login, logout, me, refresh, signup } from '../controllers/auth.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createAuthRouter = (pool) => {
  const router = Router();

  router.post('/login', asyncHandler(login(pool)));
  router.post('/signup', asyncHandler(signup(pool)));
  router.post('/refresh', asyncHandler(refresh()));
  router.post('/logout', logout());
  router.get('/me', asyncHandler(me()));

  return router;
};
