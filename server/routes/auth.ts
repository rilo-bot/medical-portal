import { Router } from 'express';
import { login, logout, me, postChangePassword } from '../controllers/auth.controller.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Login/logout/me are PUBLIC — no requireAuth here
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', me);

router.post('/change-password', requireAuth, postChangePassword);

export default router;
