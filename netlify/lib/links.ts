/**
 * Links that go into the guest's confirmation email: self-service cancellation
 * and "add to calendar".
 *
 * A cancel link is only valid with a signature over the event id, so nobody can
 * cancel someone else's booking by guessing ids. The signing key is derived from
 * GOOGLE_PRIVATE_KEY, which is already secret — no extra variable to set up.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { DURATION_MINUTES, RESTAURANT, SITE_URL, requireEnv } from "./config.js";
import { zagrebToUtc } from "./time.js";

/** Google Calendar event ids are base32hex. */
export const EVENT_ID_RE = /^[a-v0-9]{5,1024}$/;

function signingKey(): Buffer {
  // Same normalisation as calendar.ts: the key may arrive with literal \n or real line breaks
  // depending on where it was loaded from, and both must sign identically.
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  return createHmac("sha256", "madre-cancel-link").update(privateKey).digest();
}

export function cancelToken(eventId: string): string {
  return createHmac("sha256", signingKey()).update(eventId).digest("base64url");
}

export function isValidCancelToken(eventId: string, token: string): boolean {
  const expected = Buffer.from(cancelToken(eventId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/**
 * Base URL for links in emails. Never taken from the request on production —
 * otherwise anyone could make the restaurant's Gmail send links to their own site.
 * Local dev (http://localhost:port) is the one exception, so links work while testing.
 */
export function siteUrl(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  if (/^http:\/\/localhost:\d+$/.test(origin)) return origin;
  return process.env.URL || SITE_URL;
}

export function cancelUrl(base: string, eventId: string, lang: string): string {
  const params = new URLSearchParams({ id: eventId, t: cancelToken(eventId), lng: lang });
  return `${base}/otkazivanje?${params}`;
}

type CalendarEntry = { eventId: string; date: string; time: string; title: string; details: string };

/** 2026-09-16T10:30:00.000Z -> 20260916T103000Z */
function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function range(e: CalendarEntry): { start: Date; end: Date } {
  const start = zagrebToUtc(e.date, e.time);
  return { start, end: new Date(start.getTime() + DURATION_MINUTES * 60_000) };
}

export function googleCalendarUrl(e: CalendarEntry): string {
  const { start, end } = range(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: e.details,
    location: RESTAURANT.address,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** .ics attachment for Apple Calendar, Outlook and everything else. */
export function icsFile(e: CalendarEntry): string {
  const { start, end } = range(e);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${RESTAURANT.name}//Rezervacije//HR`,
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.eventId}@madre-reservations`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${icsText(e.title)}`,
    `DESCRIPTION:${icsText(e.details)}`,
    `LOCATION:${icsText(RESTAURANT.address)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
