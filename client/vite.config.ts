import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Suppress the red error overlay on syntax errors. While the agent is
    // mid-stream the preview will briefly see incomplete files; the runnable
    // gate runs at end-of-step. A transient parse error is not user-visible
    // without this.
    hmr: {
      overlay: false,
    },
    // The app is built for single-origin serving (the server serves the built client
    // via CLIENT_DIST in production/preview), so api.ts calls root-relative /api paths.
    // Running the client's own dev server separately needs this proxy to reach the
    // backend — without it, /api/* requests 404 against Vite's dev server instead.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
