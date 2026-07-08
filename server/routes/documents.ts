import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';
import { aiCostLimiter } from '../middleware/rateLimit.js';
import {
  getDocuments,
  postUpload,
  postUrl,
  postReindex,
  deleteDoc,
} from '../controllers/documents.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(requireAuth);

router.get('/', getDocuments);
router.post('/upload', requireAdmin, upload.single('file'), postUpload);
router.post('/url', requireAdmin, postUrl);
router.post('/:id/reindex', requireAdmin, aiCostLimiter, postReindex);
router.delete('/:id', requireAdmin, deleteDoc);

export default router;
