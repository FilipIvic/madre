/**
 * Input validation for the reserve endpoint.
 * Returns machine-readable codes so the frontend can show them in HR or EN.
 */

import { MAX_DAYS_AHEAD, MAX_PARTY_SIZE } from "./config.js";
import { slotsForDate } from "./rules.js";
import { daysBetween, zagrebToday } from "./time.js";

export type ReservationInput = {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  lang: "hr" | "en";
};

export type ValidationResult =
  | { ok: true; value: ReservationInput }
  | { ok: false; code: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s\-/()]{5,19}$/;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validate(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) return { ok: false, code: "BAD_REQUEST" };
  const b = body as Record<string, unknown>;

  // Honeypot: real guests never see this field, bots fill everything in.
  if (str(b.company) !== "") return { ok: false, code: "BAD_REQUEST" };

  const date = str(b.date);
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) {
    return { ok: false, code: "INVALID_DATE" };
  }

  const offset = daysBetween(zagrebToday(), date);
  if (offset < 0) return { ok: false, code: "DATE_IN_PAST" };
  if (offset > MAX_DAYS_AHEAD) return { ok: false, code: "DATE_TOO_FAR" };

  const time = str(b.time);
  if (!TIME_RE.test(time) || !slotsForDate(date).includes(time)) {
    return { ok: false, code: "INVALID_TIME" };
  }

  const guests = Number(b.guests);
  if (!Number.isInteger(guests) || guests < 1) return { ok: false, code: "INVALID_GUESTS" };
  if (guests > MAX_PARTY_SIZE) return { ok: false, code: "PARTY_TOO_LARGE" };

  const name = str(b.name);
  if (name.length < 2 || name.length > 80) return { ok: false, code: "INVALID_NAME" };

  const phone = str(b.phone);
  if (!PHONE_RE.test(phone)) return { ok: false, code: "INVALID_PHONE" };

  const email = str(b.email);
  if (!EMAIL_RE.test(email) || email.length > 120) return { ok: false, code: "INVALID_EMAIL" };

  const notes = str(b.notes).slice(0, 500);
  const lang = str(b.lang) === "en" ? "en" : "hr";

  return { ok: true, value: { date, time, guests, name, phone, email, notes, lang } };
}
