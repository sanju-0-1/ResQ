import { Router } from 'express';
import {
  getDashboardStats,
  getVerificationQueue,
  reviewVerification,
  getReports,
  handleUserModeration,
} from '../controllers/adminController';
import { authenticateJWT } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';

const router = Router();

router.use(authenticateJWT);
router.use(requireRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/verifications', getVerificationQueue);
router.patch('/verifications/:id', reviewVerification);
router.get('/reports', getReports);
router.patch('/users/:userId/moderation', handleUserModeration);

export default router;
