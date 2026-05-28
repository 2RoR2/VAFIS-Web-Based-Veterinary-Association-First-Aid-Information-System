import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createPet, deletePet, getPets, updatePet } from '../controllers/pets.js';

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const createPetsRouter = (pool) => {
  const router = Router();

  router.get('/',       requireAuth, asyncHandler(getPets(pool)));
  router.post('/',      requireAuth, asyncHandler(createPet(pool)));
  router.put('/:id',    requireAuth, asyncHandler(updatePet(pool)));
  router.delete('/:id', requireAuth, asyncHandler(deletePet(pool)));

  return router;
};
