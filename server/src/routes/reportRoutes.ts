import { Router } from 'express';
import { createReport } from '../controllers/reportController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createReportSchema } from '../schemas/report.schema';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateRequest(createReportSchema), createReport);

export default router;
