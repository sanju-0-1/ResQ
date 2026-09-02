import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import responderRoutes from './responderRoutes';
import emergencyRoutes from './emergencyRoutes';
import trustedContactRoutes from './trustedContactRoutes';
import reportRoutes from './reportRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/responders', responderRoutes);
router.use('/emergencies', emergencyRoutes);
router.use('/trusted-contacts', trustedContactRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ResQ Emergency Assistance Backend API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
