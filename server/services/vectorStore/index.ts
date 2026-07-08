/**
 * Vector search adapter — MongoDB Atlas Vector Search.
 * Embeddings live directly on Chunk documents (see models/Chunk.ts); this module only
 * runs the $vectorSearch aggregation against them. Writing/deleting a Chunk IS
 * writing/deleting its vector — there is no separate store to keep in sync.
 *
 * Requires a one-time Atlas Vector Search index (name: env.vectorIndexName) on the
 * `chunks` collection's `embedding` field — see scripts/setupVectorIndex.ts.
 */
import mongoose from 'mongoose';
import { Chunk } from '../../models/Chunk.js';
import { env } from '../../config/env.js';

export const EMBEDDING_DIMENSIONS = 1536; // text-embedding-3-small

export interface VectorMatch {
  id: string;
  score: number;
  documentId: string;
  collectionId: string;
  text: string;
  section: string | null;
  page: number | null;
}

function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function queryVectors(
  embedding: number[],
  topK: number,
  filter?: Record<string, unknown>,
): Promise<VectorMatch[]> {
  if (!isConnected()) return [];

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: env.vectorIndexName,
        path: 'embedding',
        queryVector: embedding,
        numCandidates: Math.max(100, topK * 15),
        limit: topK,
        ...(filter ? { filter } : {}),
      },
    },
    {
      $project: {
        _id: 1,
        documentId: 1,
        collectionId: 1,
        text: 1,
        section: 1,
        page: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  return results.map((r) => ({
    id: r._id.toString(),
    score: r.score as number,
    documentId: r.documentId.toString(),
    collectionId: r.collectionId.toString(),
    text: r.text as string,
    section: (r.section as string | null) ?? null,
    page: (r.page as number | null) ?? null,
  }));
}
