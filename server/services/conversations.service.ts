import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export async function listConversations(userId: string) {
  const convs = await Conversation.find({ userId }).sort({ updatedAt: -1 }).lean();
  return convs.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function createConversation(userId: string) {
  const conv = await Conversation.create({ userId, title: 'New conversation' });
  return {
    id: conv.id,
    title: conv.title,
    createdAt: conv.createdAt.toISOString(),
  };
}

export async function listBookmarkedMessages(userId: string) {
  const convs = await Conversation.find({ userId }).lean();
  const titleByConvId = new Map(convs.map((c) => [c._id.toString(), c.title]));
  const convIds = convs.map((c) => c._id);

  const messages = await Message.find({ conversationId: { $in: convIds }, bookmarked: true })
    .sort({ createdAt: -1 })
    .lean();

  return messages.map((m) => ({
    id: m._id.toString(),
    conversationId: m.conversationId.toString(),
    conversationTitle: titleByConvId.get(m.conversationId.toString()) ?? 'Conversation',
    role: m.role,
    content: m.content,
    complexityLevel: m.complexityLevel,
    confidence: m.confidence,
    citations: m.citations,
    supplemental: m.supplemental,
    bookmarked: m.bookmarked,
    createdAt: (m.createdAt as Date).toISOString(),
  }));
}

export async function getMessages(conversationId: string, userId: string) {
  // Verify ownership
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw Object.assign(new Error('Conversation not found'), { status: 404 });
  if (conv.userId.toString() !== userId)
    throw Object.assign(new Error('Forbidden'), { status: 403 });

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
  return messages.map((m) => ({
    id: m._id.toString(),
    role: m.role,
    content: m.content,
    complexityLevel: m.complexityLevel,
    confidence: m.confidence,
    citations: m.citations,
    supplemental: m.supplemental,
    bookmarked: m.bookmarked,
    createdAt: (m.createdAt as Date).toISOString(),
  }));
}
