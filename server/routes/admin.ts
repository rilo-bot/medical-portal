import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAuth.js';
import {
  getUsers,
  postUser,
  patchUser,
  deleteUserHandler,
  patchUserPassword,
  getAudit,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require admin role
router.use(requireAdmin);

router.get('/users', getUsers);
router.post('/users', postUser);
router.patch('/users/:id', patchUser);
router.patch('/users/:id/password', patchUserPassword);
router.delete('/users/:id', deleteUserHandler);
router.get('/audit', getAudit);

export default router;
