/**
 * All business rules live here. This is the only file you edit when the
 * restaurant changes — opening hours, capacity, how long a table is held.
 */

/** Opening hours per weekday. 0 = Sunday, 1 = Monday, ... 6 = Saturday. */
export const OPENING_HOURS: Record<number, { open: string; close: string } | null> = {
  0: { open: "11:00", close: "23:00" }, // nedjelja
  1: null,                              // ponedjeljak — zatvoreno
  2: { open: "11:00", close: "23:00" }, // utorak
  3: { open: "11:00", close: "23:00" }, // srijeda
  4: { open: "11:00", close: "23:00" }, // četvrtak
  5: { open: "11:00", close: "23:00" }, // petak
  6: { open: "11:00", close: "23:00" }, // subota
};

/** Guests pick a time every this many minutes. */
export const SLOT_MINUTES = 30;

/** How long one reservation blocks its seats. */
export const DURATION_MINUTES = 90;

/** Total guests that may be seated in any overlapping window. */
export const SEATS_PER_SLOT = Number(process.env.SEATS_PER_SLOT ?? 30);

/** Party sizes above this must call — the form says so. */
export const MAX_PARTY_SIZE = 12;

/** A booking must be at least this many minutes in the future. */
export const MIN_LEAD_MINUTES = 60;

/** How far ahead the calendar opens. */
export const MAX_DAYS_AHEAD = 60;

/**
 * An all-day or timed event whose title starts with this word closes the
 * restaurant for that period — your escape hatch for private parties and
 * holidays, set straight from the Google Calendar app on your phone.
 */
export const BLOCK_KEYWORD = "ZATVORENO";

/** Marks events this app created, so manual entries are never counted twice. */
export const APP_TAG = "madre-reservations";

export const RESTAURANT = {
  name: "Madre Bistro",
  phone: "+385953545315",
  phoneDisplay: "+385 95 35 45 315",
  email: "madre.split@gmail.com",
  address: "Ulica kralja Zvonimira 12, 21000 Split",
};

/** Secrets the app cannot run without. */
export const REQUIRED_ENV = [
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_CALENDAR_ID",
] as const;

/** Which required variables are unset — empty array means we're good to go. */
export function missingEnv(): string[] {
  return REQUIRED_ENV.filter((name) => !process.env[name]);
}

/** Throws at boot if a required secret is missing, instead of failing per request. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
