import { Router } from 'express';
import {
  listMachines,
  createMachine,
  updateMachine,
  deleteMachine,
} from '../controllers/machineController';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', requireAuth, asyncHandler(listMachines));
router.post('/', requireAuth, requireRole('admin'), asyncHandler(createMachine));
router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(updateMachine));
router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteMachine));

export default router;
