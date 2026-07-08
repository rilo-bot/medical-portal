import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export type SourceType = 'pdf' | 'docx' | 'txt' | 'html' | 'url';
export type DocStatus = 'processing' | 'indexed' | 'failed';

export interface IKBDocument extends MongoDoc {
  collectionId: mongoose.Types.ObjectId;
  title: string;
  sourceType: SourceType;
  sourceUrl: string | null;
  version: number;
  contentHash: string;
  status: DocStatus;
  pageCount: number | null;
  storageKey: string | null;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const KBDocumentSchema = new Schema<IKBDocument>(
  {
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', required: true, index: true },
    title: { type: String, required: true, trim: true },
    sourceType: { type: String, enum: ['pdf', 'docx', 'txt', 'html', 'url'], required: true },
    sourceUrl: { type: String, default: null },
    version: { type: Number, default: 1 },
    contentHash: { type: String, required: true },
    status: { type: String, enum: ['processing', 'indexed', 'failed'], default: 'processing' },
    pageCount: { type: Number, default: null },
    storageKey: { type: String, default: null },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const KBDocument = mongoose.model<IKBDocument>('KBDocument', KBDocumentSchema);
