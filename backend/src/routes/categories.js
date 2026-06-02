import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategories,
  updateCategory,
} from '../controllers/categories.js';

// Wraps an async route handler to forward any unhandled promise rejections to Express's error handler.
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Builds and returns an Express router with all content category routes registered.
export const createCategoriesRouter = (pool) => {
  const router = Router();

  router.get('/',    asyncHandler(getCategories(pool)));
  router.get('/:id', asyncHandler(getCategoryById(pool)));
  router.post('/',   requireAuth, requireRole('admin'), asyncHandler(createCategory(pool)));
  router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(updateCategory(pool)));
  router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteCategory(pool)));

  return router;
};
