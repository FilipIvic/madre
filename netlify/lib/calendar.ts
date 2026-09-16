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

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar ${res.status}: ${body.slice(0, 400)}`);
  }
  return res.json();
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
};

export async function createReservation(r: NewReservation): Promise<CalendarEvent> {
  const body = {
    summary: `${r.guests} os. — ${r.name}`,
    description: [
      `Gostiju: ${r.guests}`,
      `Ime: ${r.name}`,
      `Telefon: ${r.phone}`,
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
        email: r.email,
        phone: r.phone,
      },
    },
  };

  return call(`/calendars/${calendarId()}/events`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
