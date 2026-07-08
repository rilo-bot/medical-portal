import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { aiCostLimiter } from '../middleware/rateLimit.js';
import {
  getConversations,
  postConversation,
  getConversationMessages,
  postChat,
} from '../controllers/conversations.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', getConversations);
router.post('/', postConversation);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/chat', aiCostLimiter, postChat);

export default router;
