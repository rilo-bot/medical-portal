import type { Request, Response } from 'express';
import {
  listConversations,
  createConversation,
  getMessages,
} from '../services/conversations.service.js';
import { ragChat } from '../services/rag.service.js';
import { Conversation } from '../models/Conversation.js';
import { logAudit } from '../services/audit.service.js';
import type { ComplexityLevel } from '../models/Message.js';

export async function getConversations(req: Request, res: Response): Promise<void> {
  const convs = await listConversations(req.userId);
  res.json({ conversations: convs });
}

export async function postConversation(req: Request, res: Response): Promise<void> {
  const conv = await createConversation(req.userId);
  await logAudit(req.userId, 'CONVERSATION_CREATE', `Created conversation ${conv.id}`);
  res.status(201).json(conv);
}

export async function getConversationMessages(req: Request, res: Response): Promise<void> {
  const messages = await getMessages(req.params.id, req.userId);
  res.json({ messages });
}

export async function postChat(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { content, complexityLevel } = req.body as {
    content?: string;
    complexityLevel?: ComplexityLevel;
  };

  if (!content?.trim()) {
    res.status(400).json({ error: 'content is required' });
    return;
  }
  const level: ComplexityLevel = complexityLevel ?? 'gp';

  // Verify conversation ownership
  const conv = await Conversation.findById(id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }
  if (conv.userId.toString() !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  await logAudit(req.userId, 'CHAT_MESSAGE', `Chat in conversation ${id}`);

  await ragChat(id, req.userId, content.trim(), level, {
    onToken: (token) => {
      sendEvent({ type: 'token', value: token });
    },
    onDone: (message) => {
      sendEvent({ type: 'done', message });
      res.end();
    },
    onError: (err) => {
      sendEvent({ type: 'error', error: err.message });
      res.end();
    },
  });
}
