import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

// Fills the daily specials into the structured data in index.html from src/dailySpecials.json,
// so the menu Google reads never drifts from the one on the page.
function dailySpecialsStructuredData(): Plugin {
  return {
    name: 'daily-specials-structured-data',
    transformIndexHtml(html) {
      const specials = JSON.parse(readFileSync('src/dailySpecials.json', 'utf8'));
      const items = specials.groups.flatMap((g: { items: unknown[] }) => g.items).map(
        (i: { price: number; hr: { name: string; desc: string } }) => ({
          '@type': 'MenuItem',
          name: i.hr.name,
          description: i.hr.desc.replace(/ • /g, ', '),
          offers: { '@type': 'Offer', price: String(i.price), priceCurrency: 'EUR' },
        }),
      );
      return html.replace('"__DAILY_SPECIALS__"', JSON.stringify(items));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), dailySpecialsStructuredData()],
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
