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
| [Netlify Functions](https://docs.netlify.com/functions/overview/) | Reservation API |
| [Google Calendar API](https://developers.google.com/calendar) | Reservation storage |

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

# Start dev server (frontend only)
npm run dev

# Start frontend + reservation API together
npm run dev:api
```

Both serve the site at [http://localhost:3000](http://localhost:3000); `dev:api`
also starts the reservation functions on port 3001, which Vite proxies `/api/*` to.

Run the backend logic tests (no network or secrets needed):

```bash
npm test
```

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

## Reservations

Guests book a table from the site; each booking becomes an event in a Google
Calendar. There is no database and no second host — the API runs as Netlify
Functions next to the site.

**Setup is documented in [SETUP-REZERVACIJE.md](./SETUP-REZERVACIJE.md).**

All business rules — opening hours, capacity, how long a table is held, how far
ahead people can book — live in one file: `netlify/lib/config.ts`.

| Endpoint | Purpose |
|---|---|
| `GET /api/availability?date=YYYY-MM-DD` | Free time slots for a day |
| `POST /api/reserve` | Create a booking |

---

## Project Structure

```
├── netlify/
│   ├── functions/
│   │   ├── availability.ts   # GET  /api/availability
│   │   └── reserve.ts        # POST /api/reserve
│   └── lib/
│       ├── config.ts         # ← opening hours, capacity, all business rules
│       ├── calendar.ts       # Google Calendar client (service account)
│       ├── rules.ts          # Slot generation & capacity math
│       ├── time.ts           # Europe/Zagreb ↔ UTC conversion
│       ├── validate.ts       # Request validation
│       ├── email.ts          # Confirmation emails (Resend)
│       └── rules.test.ts     # Logic tests — npm test
├── public/
│   └── images/          # Your restaurant photos go here
├── src/
│   ├── App.tsx          # Main page with all sections
│   ├── ReservationForm.tsx  # Booking form inside the reservation modal
│   ├── PrivacyPolicy.tsx
│   ├── TermsOfService.tsx
│   ├── main.tsx         # App entry point & routing
│   └── index.css        # Global styles & theme colors
├── index.html
├── netlify.toml         # Build, functions and /api routing
└── vite.config.ts
```
