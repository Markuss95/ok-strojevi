import { Router } from 'express';
import {
  listSites,
  createSite,
  updateSite,
  deleteSite,
} from '../controllers/siteController';
import { requireAuth, adminOnly } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', requireAuth, asyncHandler(listSites));
router.post('/', ...adminOnly, asyncHandler(createSite));
router.put('/:id', ...adminOnly, asyncHandler(updateSite));
router.delete('/:id', ...adminOnly, asyncHandler(deleteSite));

export default router;
