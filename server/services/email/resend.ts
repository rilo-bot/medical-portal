/**
 * RILO Managed Email — concrete Resend adapter.
 * Keys are platform-injected: RESEND_API_KEY, EMAIL_FROM.
 * The rest of the app calls services/email/index.ts — never this file directly.
 */
import { Resend } from 'resend';
import { env } from '../../config/env.js';
import type { EmailPayload } from './index.js';

export async function sendViaResend(payload: EmailPayload): Promise<void> {
  if (!env.resendApiKey) {
    console.warn('[email/resend] RESEND_API_KEY not configured — email not sent:', payload.subject, '→', payload.to);
    return;
  }

  const resend = new Resend(env.resendApiKey);

  await resend.emails.send({
    to: payload.to,
    from: env.emailFrom,
    subject: payload.subject,
    text: payload.text,
    html: payload.html ?? payload.text,
  });
}
