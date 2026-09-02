import { Router } from 'express';
import {
  createEmergency,
  getMyActiveEmergency,
  getNearbyEmergencies,
  getEmergencyById,
  acceptEmergency,
  updateEmergencyStatus,
  cancelEmergency,
  getEmergencyMessages,
  sendEmergencyMessage,
} from '../controllers/emergencyController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createEmergencySchema, updateEmergencyStatusSchema } from '../schemas/emergency.schema';
import { emergencyRateLimiter } from '../middleware/rateLimiter';
import { checkEmergencyCooldown } from '../middleware/antiAbuse';

const router = Router();

router.use(authenticateJWT);

router.get('/active/my', getMyActiveEmergency);

router.post(
  '/',
  emergencyRateLimiter,
  checkEmergencyCooldown,
  validateRequest(createEmergencySchema),
  createEmergency
);

router.get('/nearby', getNearbyEmergencies);
router.get('/:id', getEmergencyById);
router.post('/:id/accept', acceptEmergency);
router.patch('/:id/status', validateRequest(updateEmergencyStatusSchema), updateEmergencyStatus);
router.post('/:id/cancel', cancelEmergency);

// Live Chat & Incident Messages
router.get('/:id/messages', getEmergencyMessages);
router.post('/:id/messages', sendEmergencyMessage);

export default router;
