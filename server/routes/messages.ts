import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { bookmarkMessage, exportMsg, getBookmarked } from '../controllers/messages.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/bookmarked', getBookmarked);
router.post('/:id/bookmark', bookmarkMessage);
router.post('/:id/export', exportMsg);

export default router;
