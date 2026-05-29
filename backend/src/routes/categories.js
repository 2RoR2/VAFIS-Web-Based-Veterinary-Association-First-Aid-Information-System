import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategories,
  updateCategory,
} from '../controllers/categories.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createCategoriesRouter = (pool) => {
  const router = Router();

  router.get('/',    asyncHandler(getCategories(pool)));
  router.get('/:id', asyncHandler(getCategoryById(pool)));
  router.post('/',   requireAuth, requireRole('admin'), asyncHandler(createCategory(pool)));
  router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(updateCategory(pool)));
  router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteCategory(pool)));

  return router;
};
