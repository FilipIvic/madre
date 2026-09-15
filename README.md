# Madre Bistro — Web App

Restaurant website for **Madre Bistro**, Split, Croatia.
Built with React, TypeScript, Vite, and Tailwind CSS.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Framer Motion](https://motion.dev) | Animations |
| [React Router](https://reactrouter.com) | Page routing |
| [Lucide React](https://lucide.dev) | Icons |

---

## Pages

| Route | Description |
|---|---|
| `/` | Main page (hero, about, menu, gallery, contact) |
| `/politika-privatnosti` | Privacy policy |
| `/uvjeti-koristenja` | Terms of service |

---

## Running Locally

**Prerequisites:** Node.js v20+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Adding Your Images

Place your images in the `public/images/` folder with these exact names:

| File | Used in |
|---|---|
| `hero.jpg` | Hero section background |
| `about-main.jpg` | About section — main photo |
| `about-inset.jpg` | About section — small inset photo |
| `jelo-1.jpg` | Menu — featured dish |
| `jelo-2.jpg` | Menu — second dish |
| `jelo-3.jpg` | Menu — third dish |
| `interijer.jpg` | Contact section |
| `galerija-1.jpg` | Gallery image 1 |
| `galerija-2.jpg` | Gallery image 2 |
| `galerija-3.jpg` | Gallery image 3 |
| `galerija-4.jpg` | Gallery image 4 |
| `galerija-5.jpg` | Gallery image 5 |
| `galerija-6.jpg` | Gallery image 6 |

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

---

## Build for Production

```bash
npm run build
```

Output is in the `dist/` folder — upload this to any static hosting provider.

---

## Project Structure

```
├── public/
│   └── images/          # Your restaurant photos go here
├── src/
│   ├── App.tsx          # Main page with all sections
│   ├── PrivacyPolicy.tsx
│   ├── TermsOfService.tsx
│   ├── main.tsx         # App entry point & routing
│   └── index.css        # Global styles & theme colors
├── index.html
└── vite.config.ts
```
