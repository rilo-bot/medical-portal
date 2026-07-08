import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor';
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: SessionUser; token: string }> {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const token = jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw Object.assign(new Error('Current password is incorrect'), { status: 401 });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
}

export async function getUserById(id: string): Promise<SessionUser | null> {
  const user = await User.findById(id).lean();
  if (!user) return null;
  return {
    id: (user._id as { toString(): string }).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'doctor',
): Promise<SessionUser> {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export { SEVEN_DAYS_MS };
