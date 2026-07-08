import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IAuditEntry extends MongoDoc {
  userId: mongoose.Types.ObjectId;
  action: string;
  detail: string;
  createdAt: Date;
}

const AuditEntrySchema = new Schema<IAuditEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    detail: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AuditEntry = mongoose.model<IAuditEntry>('AuditEntry', AuditEntrySchema);
