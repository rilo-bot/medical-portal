import type { Request, Response } from 'express';
import {
  listDocuments,
  uploadDocument,
  ingestUrl,
  reindexDocument,
  deleteDocument,
} from '../services/documents.service.js';
import { logAudit } from '../services/audit.service.js';

export async function getDocuments(req: Request, res: Response): Promise<void> {
  const { collectionId } = req.query as { collectionId?: string };
  const documents = await listDocuments(collectionId);
  res.json({ documents });
}

export async function postUpload(req: Request, res: Response): Promise<void> {
  const file = req.file;
  const { collectionId } = req.body as { collectionId?: string };

  if (!file) {
    res.status(400).json({ error: 'file is required' });
    return;
  }
  if (!collectionId?.trim()) {
    res.status(400).json({ error: 'collectionId is required' });
    return;
  }

  const result = await uploadDocument(file.buffer, file.originalname, collectionId, req.userId);
  await logAudit(req.userId, 'DOCUMENT_UPLOAD', `Uploaded "${result.title}" (duplicate: ${result.duplicate})`);
  res.status(201).json(result);
}

export async function postUrl(req: Request, res: Response): Promise<void> {
  const { url, collectionId } = req.body as { url?: string; collectionId?: string };
  if (!url?.trim()) {
    res.status(400).json({ error: 'url is required' });
    return;
  }
  if (!collectionId?.trim()) {
    res.status(400).json({ error: 'collectionId is required' });
    return;
  }
  const result = await ingestUrl(url.trim(), collectionId.trim(), req.userId);
  await logAudit(req.userId, 'DOCUMENT_URL_INGEST', `Ingested URL "${url}"`);
  res.status(201).json(result);
}

export async function postReindex(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await reindexDocument(id);
  await logAudit(req.userId, 'DOCUMENT_REINDEX', `Reindexed document ${id} → version ${result.version}`);
  res.json(result);
}

export async function deleteDoc(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await deleteDocument(id);
  await logAudit(req.userId, 'DOCUMENT_DELETE', `Deleted document ${id}`);
  res.json({ ok: true });
}
