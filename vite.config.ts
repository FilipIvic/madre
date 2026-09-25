import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In dev, forward /api/* to `netlify functions:serve` (see `npm run dev:api`).
    // We don't run the site through `netlify dev`: its SPA rewrite (/* → /index.html)
    // swallows Vite's module requests (/src/main.tsx, /@vite/client) and breaks the page.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        rewrite: (p) => p.replace(/^\/api/, '/.netlify/functions'),
      },
    },
  },
});
