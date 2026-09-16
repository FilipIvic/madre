# Reservations — Setup

One-time setup, ~20 minutes. Google Calendar is the database; there is nothing else to run or pay for.

```
Guest fills the form  →  Netlify Function  →  Google Calendar (the database)
                                           →  Gmail (confirmation emails)
```

---

## 1. Create the reservations calendar

Do this in the Google account that should own the bookings (e.g. `madre.split@gmail.com`).

1. Open [Google Calendar](https://calendar.google.com) → left sidebar → **Other calendars** → **+** → **Create new calendar**
2. Name it `Madre — Rezervacije`, time zone **(GMT+01:00) Central European Time — Zagreb** → **Create**

Keep this separate from your personal calendar. Everything the app writes lands here, and you can hide it with one click when you don't want to see it.

---

## 2. Create a service account

A service account is a robot Google account. It lets the website write to your calendar without anyone logging in and without tokens that expire.

1. Go to the [Google Cloud Console](https://console.cloud.google.com) and sign in
2. Top bar → project dropdown → **New Project** → name it `madre-rezervacije` → **Create**
3. Make sure the new project is selected, then enable the API:
   [console.cloud.google.com/apis/library/calendar-json.googleapis.com](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) → **Enable**
4. Go to **APIs & Services → Credentials** → **Create credentials** → **Service account**
   - Name: `madre-rezervacije`
   - Skip the optional "grant access" steps → **Done**
5. Click the service account you just made → **Keys** tab → **Add key** → **Create new key** → **JSON** → **Create**

A `.json` file downloads. It contains your private key — treat it like a password, never commit it.

---

## 3. Let the service account into your calendar

This is the step people miss. Creating the robot is not enough; you have to invite it.

1. Open the downloaded JSON, copy the value of `client_email`
   (looks like `madre-rezervacije@madre-rezervacije-123456.iam.gserviceaccount.com`)
2. Google Calendar → hover `Madre — Rezervacije` → **⋮** → **Settings and sharing**
3. **Share with specific people or groups** → **Add people** → paste that email
4. Permission: **Make changes to events** → **Send**

There is no invitation to accept — service accounts get access immediately.

---

## 4. Find your Calendar ID

Same settings page → scroll to **Integrate calendar** → copy **Calendar ID**.
It looks like `c_a1b2c3...@group.calendar.google.com`.

---

## 5. Put the secrets in Netlify

Netlify → your site → **Site configuration → Environment variables → Add a variable**.

| Variable | Value |
|---|---|
| `GOOGLE_CLIENT_EMAIL` | `client_email` from the JSON |
| `GOOGLE_PRIVATE_KEY` | `private_key` from the JSON — the whole thing, `-----BEGIN PRIVATE KEY-----` to `-----END PRIVATE KEY-----\n` |
| `GOOGLE_CALENDAR_ID` | the Calendar ID from step 4 |

**About `GOOGLE_PRIVATE_KEY`:** copy it exactly as it appears in the JSON file, keeping the literal `\n` sequences. Do not reformat it into real line breaks. The code converts them back.

Redeploy after adding variables — Netlify only injects them at build/runtime start.

---

## 6. Confirmation emails (optional)

Reservations work without this; guests just see the success screen instead of getting an email.

Emails are sent from the restaurant's own Gmail, `madre.split@gmail.com` — guests get their confirmation from it, and a copy of each new booking lands in the same inbox. Gmail allows about 500 emails a day.

1. Sign in to `madre.split@gmail.com` and open [myaccount.google.com/security](https://myaccount.google.com/security)
2. Turn on **2-Step Verification** if it isn't already (Google requires it for app passwords)
3. Open [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), name it `Madre web`, **Create**, and copy the 16-letter password
4. Add to Netlify: `GMAIL_APP_PASSWORD` = that password (spaces or not, both work)
5. Optional: `OWNER_EMAIL` = where new-booking alerts should go instead (defaults to `madre.split@gmail.com`)

Hitting **Reply** on a new-booking alert writes straight to the guest. The app password only works for sending mail; changing the Google account password revokes it, so create a new one if that ever happens.

---

## 7. Running it locally

```bash
npm install
cp .env.example .env     # fill in your real values
npm run dev:api          # http://localhost:3000 — site + API together
```

`npm run dev` still runs the frontend alone on port 3000, but `/api/*` won't work there. Use `npm run dev:api` whenever you're testing reservations.

```bash
npm test                 # slot, capacity and timezone logic (no network, no secrets)
```

---

## Day-to-day

**Seeing bookings.** Open Google Calendar on your phone. Each booking is `4 os. — Ivan Horvat`, with phone, email and any note in the description.

**Closing a day.** Create an event on the reservations calendar whose title starts with `ZATVORENO` — e.g. `ZATVORENO — privatna zabava`. An all-day event closes the whole day; a timed one closes just those hours. The website stops offering those slots straight away.

**Phone bookings.** Add them to the same calendar the way you always have — `Rezervacija`, the number of guests, then the name: `Rezervacija 4 osobe - Josipa` (a title that just starts with the number, `6 Ana`, works too). The app counts those guests in the time slot the event starts in, so the website won't overbook on top of them. A title without a number (`dostava vina`) is treated as a note and takes no seats. Website bookings are written in the same format and last one hour.

**Changing hours, capacity or how long a table is held.** All of it is in `netlify/lib/config.ts` — plain values with comments. Edit, commit, push; Netlify redeploys.

---

## What the guest experiences

1. Clicks **Rezerviraj stol** anywhere on the site
2. Picks a date → the form asks the API which times still have room
3. Picks a time, fills in name / phone / email → **Potvrdi rezervaciju**
4. Event appears in your calendar; guest and you both get an email

Rules the app enforces: closed Mondays, no bookings less than 1 hour ahead, max 60 days ahead, max 12 people online (bigger parties are told to call), a time slot closes once 4 or more guests are booked in it (neighbouring slots stay open), one booking per email per day, and capacity is re-checked at the moment of writing in case the slot filled up while they were typing.

---

## If something breaks

Netlify → **Logs → Functions** shows every call and any error.

| Symptom | Cause |
|---|---|
| `Missing environment variable: ...` | Variable not set in Netlify, or the site wasn't redeployed after adding it |
| `Google Calendar 404` | Wrong `GOOGLE_CALENDAR_ID` |
| `Google Calendar 403` | Calendar not shared with the service account, or shared with the wrong permission (needs **Make changes to events**) |
| `invalid_grant` / `error:1E08010C` | `GOOGLE_PRIVATE_KEY` got mangled — re-paste it from the JSON, keeping the literal `\n` |
| Times shown are off by an hour | Calendar time zone isn't Zagreb (step 1) |
| No emails | `GMAIL_APP_PASSWORD` missing or revoked — bookings still save; check the function log for `Email to ... failed` |
