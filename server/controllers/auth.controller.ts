import type { Request, Response } from 'express';
import { loginUser, getUserById, changePassword, SEVEN_DAYS_MS } from '../services/auth.service.js';
import { logAudit } from '../services/audit.service.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthPayload } from '../middleware/requireAuth.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const { user, token } = await loginUser(email, password);

  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
    maxAge: SEVEN_DAYS_MS,
  });

  await logAudit(user.id, 'AUTH_LOGIN', `User ${user.email} logged in`);
  res.json({ user });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.session as string | undefined;
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
      await logAudit(payload.userId, 'AUTH_LOGOUT', 'User logged out');
    } catch {
      // ignore invalid token on logout
    }
  }
  res.clearCookie('session', { path: '/' });
  res.json({ ok: true });
}

export async function postChangePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'currentPassword and newPassword are required' });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: 'newPassword must be at least 8 characters' });
    return;
  }

  await changePassword(req.userId, currentPassword, newPassword);
  await logAudit(req.userId, 'AUTH_PASSWORD_CHANGE', 'User changed their password');
  res.json({ ok: true });
}

export async function me(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.session as string | undefined;
  if (!token) {
    res.json({ user: null });
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    const user = await getUserById(payload.userId);
    res.json({ user });
  } catch {
    res.json({ user: null });
  }
}
