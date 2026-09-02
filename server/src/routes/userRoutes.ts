import { Router } from 'express';
import { getMe, updateMe, getUserPublicProfile } from '../controllers/userController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/profile/:id', getUserPublicProfile);

export default router;
