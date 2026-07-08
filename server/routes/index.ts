import { Router } from 'express';
import authRouter from './auth.js';
import collectionsRouter from './collections.js';
import documentsRouter from './documents.js';
import conversationsRouter from './conversations.js';
import messagesRouter from './messages.js';
import adminRouter from './admin.js';

const router = Router();

router.use('/api/auth', authRouter);
router.use('/api/collections', collectionsRouter);
router.use('/api/documents', documentsRouter);
router.use('/api/conversations', conversationsRouter);
router.use('/api/messages', messagesRouter);
router.use('/api/admin', adminRouter);

export default router;
