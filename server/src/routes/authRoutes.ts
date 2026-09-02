import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);
router.post('/refresh', validateRequest(refreshTokenSchema), refreshToken);
router.post('/logout', authenticateJWT, logout);

export default router;
