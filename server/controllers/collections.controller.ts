import type { Request, Response } from 'express';
import { listCollections, createCollection } from '../services/collections.service.js';
import { logAudit } from '../services/audit.service.js';

export async function getCollections(_req: Request, res: Response): Promise<void> {
  const collections = await listCollections();
  res.json({ collections });
}

export async function postCollection(req: Request, res: Response): Promise<void> {
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name?.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const col = await createCollection(name.trim(), description?.trim() ?? '', req.userId);
  await logAudit(req.userId, 'COLLECTION_CREATE', `Created collection "${col.name}"`);
  res.status(201).json(col);
}
