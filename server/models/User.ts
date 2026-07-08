import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IUser extends MongoDoc {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'doctor';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'doctor'], default: 'doctor' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const User = mongoose.model<IUser>('User', UserSchema);
