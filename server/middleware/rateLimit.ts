import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/** Login is unauthenticated and hits bcrypt — throttle hard to slow brute-force/credential-stuffing. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

/** Chat/reindex call paid AI, vector-store, and (for reindex) outbound-fetch services — cap per-user cost. */
export const aiCostLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId || ipKeyGenerator(req.ip ?? 'anonymous'),
  message: { error: 'Rate limit exceeded. Please slow down and try again shortly.' },
});
