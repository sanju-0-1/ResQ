import { Router } from 'express';
import {
  getTrustedContacts,
  addTrustedContact,
  deleteTrustedContact,
} from '../controllers/trustedContactController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getTrustedContacts);
router.post('/', addTrustedContact);
router.delete('/:id', deleteTrustedContact);

export default router;
