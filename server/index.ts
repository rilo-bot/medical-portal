import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './config/env';
import { connectDb } from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
// credentials:true is required for the browser to send/accept the httpOnly session cookie when
// the client is hosted on a different origin (e.g. separate Render services). With credentials
// enabled, `origin: true` reflects the request's actual Origin instead of using a wildcard, which
// browsers require once credentials are involved. Set CORS_ORIGIN in production to lock this to
// your deployed client's exact origin instead of reflecting any caller.
app.use(cors({ origin: env.corsOrigin || true, credentials: true }));
app.use(express.json());
// Parse cookies so auth can use an httpOnly session cookie. Read via req.cookies.<name>.
app.use(cookieParser());

// Liveness probe (the preview uses it to know the server is up).
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// All API routes (mounted from routes/index.ts).
app.use(routes);

// Single-origin preview: when the runtime injects a built client (CLIENT_DIST), serve it +
// SPA fallback so the React app and /api share one origin. Skipped in API-only dev (unset).
if (env.clientDist && existsSync(env.clientDist)) {
  app.use(express.static(env.clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(join(env.clientDist, 'index.html'));
  });
}

// Central error handler — keep it last.
app.use(errorHandler);

// Readiness must NOT depend on the database. Open the port + /health FIRST so the preview is healthy
// immediately, THEN connect to Mongo in the BACKGROUND. A slow / unreachable / blipping DB can never
// stop the server from listening (the preview's readiness signal). Mongoose buffers queries until the
// connection attaches, so data routes still work once the DB is up.
app.listen(env.port, () => {
  console.log(`server listening on :${env.port}`);
});

// Background connect — never awaited (so it can't block listen) and never throws (connectDb logs +
// retries on its own).
void connectDb();
