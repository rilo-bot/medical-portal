/**
 * Chunking, embedding, and storage for a document.
 * Embeddings are stored directly on each Chunk document (see models/Chunk.ts) and searched
 * via a MongoDB Atlas Vector Search index — no separate vector store to keep in sync.
 * Also handles deduplication (by contentHash) and versioning.
 */
import crypto from 'crypto';
import { KBDocument } from '../models/KBDocument.js';
import { Chunk } from '../models/Chunk.js';
import { createEmbedding } from './ai/index.js';

const CHUNK_SIZE = 800;       // characters
const CHUNK_OVERLAP = 100;    // characters

export function hashContent(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Split text into overlapping chunks preserving approximate sentence boundaries.
 */
export function chunkText(
  text: string,
  documentId: string,
  collectionId: string,
): { documentId: string; collectionId: string; text: string; section: string | null; page: number | null }[] {
  const chunks: ReturnType<typeof chunkText> = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    // Try to break at a sentence boundary
    if (end < text.length) {
      const breakAt = text.lastIndexOf('.', end);
      if (breakAt > start + CHUNK_SIZE / 2) end = breakAt + 1;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 20) {
      chunks.push({
        documentId,
        collectionId,
        text: chunk,
        section: null,
        page: null,
      });
    }
    // We've consumed the rest of the text — stop instead of computing a new start from the
    // overlap, which can go backward (or stay put) for short inputs and loop forever.
    if (end >= text.length) break;
    // Guarantee forward progress every iteration regardless of input length/content.
    start = Math.max(start + 1, end - CHUNK_OVERLAP);
  }
  return chunks;
}

export async function indexDocument(documentId: string, text: string): Promise<void> {
  const doc = await KBDocument.findById(documentId);
  if (!doc) throw new Error(`Document ${documentId} not found`);

  // Remove old chunks for this doc (re-index / version bump) — this also removes their embeddings.
  await Chunk.deleteMany({ documentId });

  const rawChunks = chunkText(text, documentId, doc.collectionId.toString());

  // Embed and save in batches of 10 to stay within AI provider rate limits
  const BATCH = 10;
  for (let i = 0; i < rawChunks.length; i += BATCH) {
    const batch = rawChunks.slice(i, i + BATCH);
    const embeddings = await Promise.all(batch.map((c) => createEmbedding(c.text)));

    await Chunk.insertMany(
      batch.map((c, idx) => ({
        documentId: c.documentId,
        collectionId: c.collectionId,
        text: c.text,
        section: c.section,
        page: c.page,
        embedding: embeddings[idx],
      })),
    );
  }

  await KBDocument.findByIdAndUpdate(documentId, { status: 'indexed' });
}

export async function indexDocumentSafe(documentId: string, text: string): Promise<void> {
  try {
    await indexDocument(documentId, text);
  } catch (err) {
    console.error(`indexing failed for ${documentId}:`, err instanceof Error ? err.message : err);
    await KBDocument.findByIdAndUpdate(documentId, { status: 'failed' });
  }
}
