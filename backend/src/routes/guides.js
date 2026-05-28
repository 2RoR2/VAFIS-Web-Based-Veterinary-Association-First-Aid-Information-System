import { Router } from 'express';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';
import {
  createGuide,
  deleteGuide,
  getAdminGuides,
  getGuideById,
  getPublishedGuides,
  publishGuide,
  reviewGuide,
  searchGuides,
  submitForReview,
  unpublishGuide,
  updateGuide,
} from '../controllers/guides.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createGuidesRouter = (pool) => {
  const router = Router();

  // Public — published guides only
  router.get('/', asyncHandler(getPublishedGuides(pool)));

  // Search — published guides with strategy-based filtering (must be before /:id)
  router.get('/search', asyncHandler(searchGuides(pool)));

  // Admin + Vet — all statuses (must be before /:id to avoid route conflict)
  router.get('/admin', requireAuth, requireRole('admin', 'professional'), asyncHandler(getAdminGuides(pool)));

  // Single guide — published for public, any status for admin/vet
  router.get('/:id', optionalAuth, asyncHandler(getGuideById(pool)));

  // Admin — create / update / delete
  router.post('/', requireAuth, requireRole('admin'), asyncHandler(createGuide(pool)));
  router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(updateGuide(pool)));
  router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteGuide(pool)));

  // Admin — workflow transitions
  router.post('/:id/submit', requireAuth, requireRole('admin'), asyncHandler(submitForReview(pool)));
  router.post('/:id/publish', requireAuth, requireRole('admin'), asyncHandler(publishGuide(pool)));
  router.post('/:id/unpublish', requireAuth, requireRole('admin'), asyncHandler(unpublishGuide(pool)));

  // Vet — review
  router.post('/:id/review', requireAuth, requireRole('professional'), asyncHandler(reviewGuide(pool)));

  return router;
};
