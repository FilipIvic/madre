/**
 * Turns a day's calendar events into "which times can still be booked".
 * Pure functions — no network, no dates read from the clock except `now`.
 */

import type { CalendarEvent } from "./calendar.js";
import {
  APP_TAG,
  BLOCK_KEYWORD,
  DURATION_MINUTES,
  MAX_PARTY_SIZE,
  MIN_LEAD_MINUTES,
  OPENING_HOURS,
  SLOT_FULL_AT_GUESTS,
  SLOT_MINUTES,
} from "./config.js";
import { addMinutes, toMinutes, weekdayOf, zagrebToUtc } from "./time.js";

export type Slot = { time: string; remaining: number };

/** Every bookable start time for a date, ignoring who has already booked. */
export function slotsForDate(dateStr: string): string[] {
  const hours = OPENING_HOURS[weekdayOf(dateStr)];
  if (!hours) return [];

  const first = toMinutes(hours.open);
  // The last table must finish by closing time.
  const last = toMinutes(hours.close) - DURATION_MINUTES;

  const times: string[] = [];
  for (let m = first; m <= last; m += SLOT_MINUTES) {
    times.push(addMinutes("00:00", m));
  }
  return times;
}

function rangeOf(e: CalendarEvent): { start: number; end: number } {
  if (e.start.dateTime && e.end.dateTime) {
    return { start: Date.parse(e.start.dateTime), end: Date.parse(e.end.dateTime) };
  }
  // All-day event: end.date is exclusive in the Google API.
  return {
    start: zagrebToUtc(e.start.date!, "00:00").getTime(),
    end: zagrebToUtc(e.end.date!, "00:00").getTime(),
  };
}

/**
 * Guests an event brings. Bookings this app made carry an exact count;
 * anything typed into Google Calendar by hand counts if its title starts with
 * "Rezervacija" and a number — "Rezervacija 4 osobe - Josipa" — or just the
 * number, "4 Ana (telefon)". Everything else is treated as a note.
 */
function guestsOf(e: CalendarEvent): number {
  const props = e.extendedProperties?.private;
  if (props?.app === APP_TAG) return Number(props.guests) || 0;

  const match = /^\s*(?:rezervacija\b[\s:–—-]*)?(\d{1,2})\b/i.exec(e.summary ?? "");
  return match ? Number(match[1]) : 0;
}

function isBlock(e: CalendarEvent): boolean {
  return (e.summary ?? "").trim().toUpperCase().startsWith(BLOCK_KEYWORD);
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Largest party that can still book `time` on `dateStr` — 0 means the slot is taken.
 *
 * Only reservations starting within this slot count, so a big table at 12:30
 * closes 12:30 but leaves 13:00 open. The slot closes once SLOT_FULL_AT_GUESTS
 * or more guests are booked in it. A ZATVORENO block closes
 * every slot whose table would overlap it.
 */
export function remainingSeats(dateStr: string, time: string, events: CalendarEvent[]): number {
  const slotStart = zagrebToUtc(dateStr, time).getTime();
  const slotEnd = zagrebToUtc(dateStr, addMinutes(time, SLOT_MINUTES)).getTime();
  const table = {
    start: slotStart,
    end: zagrebToUtc(dateStr, addMinutes(time, DURATION_MINUTES)).getTime(),
  };

  let booked = 0;
  for (const e of events) {
    const range = rangeOf(e);
    if (isBlock(e)) {
      if (overlaps(table, range)) return 0; // closed for this period
      continue;
    }
    if (range.start >= slotStart && range.start < slotEnd) booked += guestsOf(e);
  }

  return booked >= SLOT_FULL_AT_GUESTS ? 0 : MAX_PARTY_SIZE;
}

/** True once a slot is too close to now (or already past) to accept online. */
export function isTooLate(dateStr: string, time: string, now: Date): boolean {
  const slotMs = zagrebToUtc(dateStr, time).getTime();
  return slotMs - now.getTime() < MIN_LEAD_MINUTES * 60_000;
}

/** The full picture for one day, ready to hand to the frontend. */
export function availability(dateStr: string, events: CalendarEvent[], now: Date): Slot[] {
  return slotsForDate(dateStr)
    .filter((time) => !isTooLate(dateStr, time, now))
    .map((time) => ({ time, remaining: remainingSeats(dateStr, time, events) }));
}
