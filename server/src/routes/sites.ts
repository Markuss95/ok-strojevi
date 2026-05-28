import { Router } from 'express';
import {
  listSites,
  createSite,
  updateSite,
  deleteSite,
} from '../controllers/siteController';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', requireAuth, asyncHandler(listSites));
router.post('/', requireAuth, requireRole('admin'), asyncHandler(createSite));
router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(updateSite));
router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteSite));

export default router;
