import { User } from '../models/User.js';
import { AuditEntry } from '../models/AuditEntry.js';
import { createUser } from './auth.service.js';

export async function listUsers() {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: (u.createdAt as Date).toISOString(),
  }));
}

export async function addUser(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'doctor',
) {
  return createUser(name, email, password, role);
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'doctor',
): Promise<{ id: string; role: 'admin' | 'doctor' }> {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return { id: user.id, role: user.role };
}

export async function listAuditEntries() {
  const entries = await AuditEntry.find().sort({ createdAt: -1 }).limit(500).lean();
  return entries.map((e) => ({
    id: e._id.toString(),
    userId: e.userId.toString(),
    action: e.action,
    detail: e.detail,
    createdAt: (e.createdAt as Date).toISOString(),
  }));
}
