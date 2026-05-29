import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getFeedback, submitFeedback, updateFeedbackStatus } from '../controllers/feedback.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createFeedbackRouter = (pool) => {
  const router = Router();

  // Admin / professional only — view all feedback for content quality review
  router.get('/', requireAuth, requireRole('admin', 'professional'), asyncHandler(getFeedback(pool)));

  // Any logged-in user — submit feedback (submittedBy taken from JWT)
  router.post('/', requireAuth, asyncHandler(submitFeedback(pool)));

  // Admin only — update review status
  router.put('/:id/status', requireAuth, requireRole('admin'), asyncHandler(updateFeedbackStatus(pool)));

  return router;
};
