/**
 * Email service interface — the rest of the app calls only sendEmail().
 * Concrete implementation: RILO managed email via Resend (services/email/resend.ts).
 * To swap providers, create a new adapter file and change the import below — nothing else changes.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { sendViaResend } = await import('./resend.js');
  await sendViaResend(payload);
}
