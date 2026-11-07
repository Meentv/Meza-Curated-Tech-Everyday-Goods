import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* SPA dev/build config.
   - `server.allowedHosts: true` keeps the proxied preview host working.
   - BrowserRouter needs a history fallback; Vite provides it in dev and preview.
   - Deploying under a sub-path (GitHub Pages project site) works by building
     with BASE_PATH=/repo-name/ — the router picks the base up automatically. */
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
});
