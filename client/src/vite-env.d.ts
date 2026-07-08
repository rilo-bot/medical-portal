/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute URL of a separately-hosted API (e.g. https://your-server.onrender.com). Leave
   * unset for same-origin serving or local dev (the Vite proxy forwards /api to the server). */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
