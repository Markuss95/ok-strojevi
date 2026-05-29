import { Router } from 'express';
import {
  listMachines,
  createMachine,
  updateMachine,
  deleteMachine,
} from '../controllers/machineController';
import { requireAuth, adminOnly } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', requireAuth, asyncHandler(listMachines));
router.post('/', ...adminOnly, asyncHandler(createMachine));
router.put('/:id', ...adminOnly, asyncHandler(updateMachine));
router.delete('/:id', ...adminOnly, asyncHandler(deleteMachine));

export default router;
