import { AuditEntry } from '../models/AuditEntry.js';

export async function logAudit(
  userId: string,
  action: string,
  detail: string,
): Promise<void> {
  try {
    await AuditEntry.create({ userId, action, detail });
  } catch (err) {
    // Audit failures must never break primary operations
    console.error('audit log error:', err instanceof Error ? err.message : err);
  }
}
