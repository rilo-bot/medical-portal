import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IConversation extends MongoDoc {
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New conversation' },
  },
  { timestamps: true },
);

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
