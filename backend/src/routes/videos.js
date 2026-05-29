import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createVideo, deleteVideo, getVideoById, getVideos, updateVideo } from '../controllers/videos.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createVideosRouter = (pool) => {
  const router = Router();

  router.get('/', asyncHandler(getVideos(pool)));
  router.get('/:id', asyncHandler(getVideoById(pool)));
  router.post('/', requireAuth, requireRole('admin'), asyncHandler(createVideo(pool)));
  router.put('/:id', requireAuth, requireRole('admin', 'professional'), asyncHandler(updateVideo(pool)));
  router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteVideo(pool)));

  return router;
};
