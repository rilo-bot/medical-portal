import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';
import { getCollections, postCollection } from '../controllers/collections.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', getCollections);
router.post('/', requireAdmin, postCollection);

export default router;
