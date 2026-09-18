/**
 * Google Calendar is the database.
 *
 * Auth is a service account: no OAuth screen, no refresh tokens, no user
 * login. You share the calendar with the service account's email once and it
 * can read and write events forever.
 */

import { JWT } from "google-auth-library";
import { APP_TAG, requireEnv } from "./config.js";
import { TZ, nextDay, zagrebToUtc } from "./time.js";

const API = "https://www.googleapis.com/calendar/v3";

export type CalendarEvent = {
  id: string;
  status?: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Record<string, string> };
};

/** Reused across warm invocations — the library caches the access token itself. */
let client: JWT | null = null;

function auth(): JWT {
  if (!client) {
    client = new JWT({
      email: requireEnv("GOOGLE_CLIENT_EMAIL"),
      // Netlify env vars store the key with literal \n sequences.
      key: requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
  }
  return client;
}

export class CalendarError extends Error {
  constructor(
    readonly status: number,
    body: string,
  ) {
    super(`Google Calendar ${status}: ${body.slice(0, 400)}`);
  }
}

async function call(path: string, init: RequestInit = {}): Promise<any> {
  const { token } = await auth().getAccessToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) throw new CalendarError(res.status, await res.text());
  // DELETE answers 204 with no body.
  return res.status === 204 ? null : res.json();
}

function calendarId(): string {
  return encodeURIComponent(requireEnv("GOOGLE_CALENDAR_ID"));
}

/**
 * Every event touching the given Zagreb day. Google returns anything that
 * overlaps the window, so a booking running in from the night before counts.
 */
export async function listDayEvents(dateStr: string): Promise<CalendarEvent[]> {
  const timeMin = zagrebToUtc(dateStr, "00:00").toISOString();
  const timeMax = zagrebToUtc(nextDay(dateStr), "00:00").toISOString();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "2500",
  });

  const data = await call(`/calendars/${calendarId()}/events?${params}`);
  return (data.items ?? []) as CalendarEvent[];
}

export type NewReservation = {
  date: string;
  time: string;
  endTime: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  lang: string;
};

/** Croatian plural, matching how bookings are written by hand: 1 osoba, 2–4 osobe, 5+ osoba. */
function osobaForm(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "osoba";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) return "osobe";
  return "osoba";
}

export async function createReservation(r: NewReservation): Promise<CalendarEvent> {
  const body = {
    summary: `Rezervacija ${r.guests} ${osobaForm(r.guests)} - ${r.name}`,
    description: [
      `Gostiju: ${r.guests}`,
      `Ime: ${r.name}`,
      r.phone ? `Telefon: ${r.phone}` : null,
      `Email: ${r.email}`,
      r.notes ? `Napomena: ${r.notes}` : null,
      "",
      "Rezervirano preko web stranice.",
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: `${r.date}T${r.time}:00`, timeZone: TZ },
    end: { dateTime: `${r.date}T${r.endTime}:00`, timeZone: TZ },
    extendedProperties: {
      private: {
        app: APP_TAG,
        guests: String(r.guests),
        name: r.name,
        email: r.email,
        ...(r.phone && { phone: r.phone }),
        lang: r.lang,
      },
    },
  };

  return call(`/calendars/${calendarId()}/events`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** One event by id, or null if it doesn't exist or was already deleted. */
export async function getEvent(eventId: string): Promise<CalendarEvent | null> {
  try {
    const event: CalendarEvent = await call(`/calendars/${calendarId()}/events/${encodeURIComponent(eventId)}`);
    return event.status === "cancelled" ? null : event;
  } catch (error) {
    if (error instanceof CalendarError && (error.status === 404 || error.status === 410)) return null;
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  await call(`/calendars/${calendarId()}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
}
