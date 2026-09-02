import { Router } from 'express';
import {
  applyAsResponder,
  getResponderStatus,
  updateAvailability,
  updateLocation,
} from '../controllers/responderController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { applyResponderSchema, updateAvailabilitySchema, updateLocationSchema } from '../schemas/responder.schema';

const router = Router();

router.use(authenticateJWT);

router.post('/apply', validateRequest(applyResponderSchema), applyAsResponder);
router.get('/status', getResponderStatus);
router.patch('/availability', validateRequest(updateAvailabilitySchema), updateAvailability);
router.patch('/location', validateRequest(updateLocationSchema), updateLocation);

export default router;
