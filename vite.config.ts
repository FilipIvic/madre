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
      type Dish = { hr: { name: string; desc: string } };
      type Menu = { price: number; starter: Dish; main: Dish; dessert: Dish };
      const specials = JSON.parse(readFileSync('src/dailySpecials.json', 'utf8'));
      const item = (name: string, description: string, price: number) => ({
        '@type': 'MenuItem',
        name,
        description,
        offers: { '@type': 'Offer', price: String(price), priceCurrency: 'EUR' },
      });
      const items = [
        ...specials.menus.map((m: Menu, i: number) =>
          item(`Meni ${i + 1}`, [m.starter, m.main, m.dessert].map((d) => d.hr.name).join(', '), m.price),
        ),
        ...specials.extras.map((e: Dish & { price: number }) => item(e.hr.name, e.hr.desc.replace(/ • /g, ', '), e.price)),
      ];
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
