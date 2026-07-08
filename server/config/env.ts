/**
 * Central, typed configuration + secrets. Every environment variable the app needs is declared
 * here and mirrored in .env.example. Read config from here — never reach into process.env
 * elsewhere, never hardcode a key.
 */

// JWT_SECRET signs every session token in the app — a hardcoded fallback here would let anyone
// who reads this file forge an admin session. Fail loudly at startup instead of running insecurely.
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET is not set. Refusing to start with an insecure default — set JWT_SECRET in the environment.'
  );
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // Injected by the preview runtime (single-origin Docker run). Unset in API-only dev.
  mongoUri: process.env.MONGO_URI ?? '',
  clientDist: process.env.CLIENT_DIST ?? '',

  // App-internal secrets — platform auto-generates and injects these
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

  // RILO Managed AI (OpenAI-compatible) — platform-injected, never ask the user
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',

  // RILO Managed Storage (S3-compatible) — platform-injected, never ask the user
  s3Endpoint: process.env.S3_ENDPOINT ?? '',
  s3Region: process.env.S3_REGION ?? 'us-east-1',
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  s3Bucket: process.env.S3_BUCKET ?? '',
  s3KeyPrefix: process.env.S3_KEY_PREFIX ?? '',

  // RILO Managed Email (Resend) — platform-injected, never ask the user
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'noreply@clinicalmind.app',

  // MongoDB Atlas Vector Search — name of the index created by scripts/setupVectorIndex.ts
  vectorIndexName: process.env.VECTOR_INDEX_NAME ?? 'vector_index',
};
