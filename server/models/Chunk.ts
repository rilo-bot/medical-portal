import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IChunk extends MongoDoc {
  documentId: mongoose.Types.ObjectId;
  collectionId: mongoose.Types.ObjectId;
  text: string;
  section: string | null;
  page: number | null;
  embedding: number[]; // text-embedding-3-small output (1536 dims) — indexed by an Atlas Vector Search index
  createdAt: Date;
}

const ChunkSchema = new Schema<IChunk>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'KBDocument', required: true, index: true },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', required: true, index: true },
    text: { type: String, required: true },
    section: { type: String, default: null },
    page: { type: Number, default: null },
    embedding: { type: [Number], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Chunk = mongoose.model<IChunk>('Chunk', ChunkSchema);
