import type { Request, Response } from 'express';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { exportMessage } from '../services/export.service.js';
import { listBookmarkedMessages } from '../services/conversations.service.js';
import { logAudit } from '../services/audit.service.js';

async function verifyMessageOwnership(messageId: string, userId: string) {
  const msg = await Message.findById(messageId);
  if (!msg) throw Object.assign(new Error('Message not found'), { status: 404 });
  const conv = await Conversation.findById(msg.conversationId);
  if (!conv || conv.userId.toString() !== userId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }
  return msg;
}

export async function getBookmarked(req: Request, res: Response): Promise<void> {
  const messages = await listBookmarkedMessages(req.userId);
  res.json({ messages });
}

export async function bookmarkMessage(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { bookmarked } = req.body as { bookmarked?: boolean };

  if (typeof bookmarked !== 'boolean') {
    res.status(400).json({ error: 'bookmarked (boolean) is required' });
    return;
  }

  const msg = await verifyMessageOwnership(id, req.userId);
  msg.bookmarked = bookmarked;
  await msg.save();

  await logAudit(req.userId, 'MESSAGE_BOOKMARK', `Message ${id} bookmarked=${bookmarked}`);
  res.json({ id: msg.id, bookmarked: msg.bookmarked });
}

export async function exportMsg(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { format } = req.body as { format?: 'pdf' | 'docx' };

  if (!format || !['pdf', 'docx'].includes(format)) {
    res.status(400).json({ error: 'format must be "pdf" or "docx"' });
    return;
  }

  const msg = await verifyMessageOwnership(id, req.userId);

  const result = await exportMessage(msg.id, msg.content, msg.citations, format);
  await logAudit(req.userId, 'MESSAGE_EXPORT', `Exported message ${id} as ${format}`);
  res.json(result);
}
