import type { Request, Response } from 'express';
import { loginUser, getUserById, changePassword } from '../services/auth.service.js';
import { logAudit } from '../services/audit.service.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthPayload } from '../middleware/requireAuth.js';

// Auth uses a Bearer token (Authorization header), not a cookie — the client and server are
// typically on different origins (separate Render services), and cookies require SameSite=None
// cross-origin, which browsers increasingly restrict/block outright. The client stores the token
// itself (localStorage) and attaches it to every request; the server just verifies the JWT.

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const { user, token } = await loginUser(email, password);

  await logAudit(user.id, 'AUTH_LOGIN', `User ${user.email} logged in`);
  res.json({ user, token });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = extractBearerToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
      await logAudit(payload.userId, 'AUTH_LOGOUT', 'User logged out');
    } catch {
      // ignore invalid token on logout
    }
  }
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
  const token = extractBearerToken(req);
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
