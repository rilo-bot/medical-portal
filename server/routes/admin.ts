import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAuth.js';
import { getUsers, postUser, patchUser, getAudit } from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require admin role
router.use(requireAdmin);

router.get('/users', getUsers);
router.post('/users', postUser);
router.patch('/users/:id', patchUser);
router.get('/audit', getAudit);

export default router;
