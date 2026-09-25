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
| [React Router](https://reactrouter.com) | Page routing |
| [Lucide React](https://lucide.dev) | Icons |
| [Netlify Functions](https://docs.netlify.com/functions/overview/) | Reservation API |
| [Google Calendar API](https://developers.google.com/calendar) | Reservation storage |

---

## Pages

| Route | Description |
|---|---|
| `/` | Main page (hero, about, menu, gallery, contact) |
| `/rezervacija` | Main page with the reservation form open — the link for Google Business Profile |
| `/otkazivanje` | Guest cancels a booking from the link in their confirmation email |
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

## Images

Photos live in `public/images/` as `.webp`, with a `-sm` variant for the large ones so
phones download less. Each section in `src/App.tsx` references its files by name; the
gallery list, and which entries are dishes, is the `galleryImages` array in `Gallery`.

---

## Build for Production

```bash
npm run build
```

Output is in the `dist/` folder. Netlify runs this on every push to `main`.

## Languages

Croatian is the default; the HR/EN switch in the navbar remembers the choice. Text lives in
`src/locales/hr.ts` and `src/locales/en.ts`, read through the small `useTranslation` hook in
`src/i18n.ts` (no library). Every key must exist in both files.

---

## Daily specials

The dishes under "Dnevna jela" come from `src/dailySpecials.json`, one entry per dish with its
price and Croatian and English text. To change the menu, edit that file on GitHub (open it,
click the pencil, commit) and set `"updated"` to today's date; Netlify redeploys on the commit
and the page shows the date next to the specials.

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
│   │   ├── cancel.ts         # GET/POST /api/cancel
│   │   └── reserve.ts        # POST /api/reserve
│   └── lib/
│       ├── config.ts         # ← opening hours, capacity, all business rules
│       ├── calendar.ts       # Google Calendar client (service account)
│       ├── rules.ts          # Slot generation & capacity math
│       ├── time.ts           # Europe/Zagreb ↔ UTC conversion
│       ├── validate.ts       # Request validation
│       ├── email.ts          # Confirmation emails (Gmail SMTP)
│       ├── links.ts          # Signed cancel links, Google Calendar link, .ics
│       ├── http.ts           # JSON response helper
│       └── rules.test.ts     # Logic tests — npm test
├── public/
│   └── images/          # Your restaurant photos go here
├── src/
│   ├── App.tsx          # Main page with all sections
│   ├── ReservationForm.tsx  # Booking form inside the reservation modal
│   ├── CancelReservation.tsx  # /otkazivanje, opened from the confirmation email
│   ├── CookieConsent.tsx    # Analytics consent banner
│   ├── PrivacyPolicy.tsx
│   ├── TermsOfService.tsx
│   ├── Reveal.tsx       # Scroll-in fade used by the sections
│   ├── dailySpecials.json   # ← the daily menu, editable on GitHub
│   ├── i18n.ts          # useTranslation hook (HR/EN)
│   ├── locales/         # hr.ts, en.ts — all site text
│   ├── main.tsx         # App entry point & routing
│   └── index.css        # Global styles, theme colors, animations
├── index.html
├── netlify.toml         # Build, functions and /api routing
└── vite.config.ts
```
