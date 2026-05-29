import { Router } from 'express';
import { createWorkLog, listWorkLogs } from '../controllers/workLogController';
import { requireAuth, adminOnly } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Any authenticated user can submit a daily machine log…
router.post('/', requireAuth, asyncHandler(createWorkLog));
// …but only admins can review all submissions.
router.get('/', ...adminOnly, asyncHandler(listWorkLogs));

export default router;
