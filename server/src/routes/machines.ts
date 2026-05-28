import { Router } from 'express';
import { listMachines, createMachine } from '../controllers/machineController';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', requireAuth, asyncHandler(listMachines));
router.post('/', requireAuth, requireRole('admin'), asyncHandler(createMachine));

export default router;
