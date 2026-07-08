/**
 * One-time setup: creates the MongoDB Atlas Vector Search index the RAG pipeline
 * queries against (server/services/vectorStore/index.ts).
 *
 * Usage: npm run setup:vector-index
 * Requires MONGO_URI to point at a MongoDB Atlas cluster — this is an Atlas-only feature,
 * a local/self-hosted mongod cannot create or serve this index.
 *
 * Safe to re-run: exits without error if an index with this name already exists.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { EMBEDDING_DIMENSIONS } from '../services/vectorStore/index.js';

async function setupVectorIndex() {
  if (!env.mongoUri) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  console.log('connected to mongo');

  const collection = mongoose.connection.collection('chunks');

  const existing = await collection.listSearchIndexes(env.vectorIndexName).toArray();
  if (existing.length > 0) {
    console.log(`Vector search index "${env.vectorIndexName}" already exists — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  await collection.createSearchIndex({
    name: env.vectorIndexName,
    type: 'vectorSearch',
    definition: {
      fields: [
        {
          type: 'vector',
          path: 'embedding',
          numDimensions: EMBEDDING_DIMENSIONS,
          similarity: 'cosine',
        },
        { type: 'filter', path: 'documentId' },
        { type: 'filter', path: 'collectionId' },
      ],
    },
  });

  console.log(
    `Created vector search index "${env.vectorIndexName}" on chunks.embedding. ` +
      'Atlas takes a minute or two to finish building it before it can be queried — ' +
      'check status in the Atlas UI under Search, or re-run this script (it will report ' +
      'the index already exists once ready).',
  );

  await mongoose.disconnect();
}

setupVectorIndex().catch((err) => {
  console.error('setup:vector-index failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
