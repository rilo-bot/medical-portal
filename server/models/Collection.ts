import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface ICollection extends MongoDoc {
  name: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
