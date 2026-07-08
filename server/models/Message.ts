import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface ICitation {
  documentId: string;
  title: string;
  section: string | null;
  page: number | null;
  snippet: string;
}

export type ComplexityLevel = 'consultant' | 'gp' | 'student' | 'patient';

export interface IMessage extends MongoDoc {
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  complexityLevel: ComplexityLevel | null;
  confidence: number | null;
  citations: ICitation[];
  supplemental: boolean;
  bookmarked: boolean;
  followUps: string[];
  createdAt: Date;
}

const CitationSchema = new Schema<ICitation>(
  {
    documentId: { type: String, required: true },
    title: { type: String, required: true },
    section: { type: String, default: null },
    page: { type: Number, default: null },
    snippet: { type: String, required: true },
  },
  { _id: false },
);

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    complexityLevel: {
      type: String,
      enum: ['consultant', 'gp', 'student', 'patient', null],
      default: null,
    },
    confidence: { type: Number, default: null },
    citations: { type: [CitationSchema], default: [] },
    supplemental: { type: Boolean, default: false },
    bookmarked: { type: Boolean, default: false },
    followUps: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
