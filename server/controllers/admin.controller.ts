import type { Request, Response } from 'express';
import { listUsers, addUser, updateUserRole, listAuditEntries } from '../services/admin.service.js';
import { logAudit } from '../services/audit.service.js';

export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await listUsers();
  res.json({ users });
}

export async function postUser(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: 'admin' | 'doctor';
  };

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'name, email, and password are required' });
    return;
  }
  if (!role || !['admin', 'doctor'].includes(role)) {
    res.status(400).json({ error: 'role must be "admin" or "doctor"' });
    return;
  }

  const user = await addUser(name.trim(), email.trim(), password, role);
  await logAudit(req.userId, 'ADMIN_USER_CREATE', `Created user ${user.email} with role ${user.role}`);
  res.status(201).json(user);
}

export async function patchUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { role } = req.body as { role?: 'admin' | 'doctor' };

  if (!role || !['admin', 'doctor'].includes(role)) {
    res.status(400).json({ error: 'role must be "admin" or "doctor"' });
    return;
  }

  const result = await updateUserRole(id, role);
  await logAudit(req.userId, 'ADMIN_USER_ROLE_UPDATE', `Updated user ${id} role to ${role}`);
  res.json(result);
}

export async function getAudit(_req: Request, res: Response): Promise<void> {
  const entries = await listAuditEntries();
  res.json({ entries });
}
