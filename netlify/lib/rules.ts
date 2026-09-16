/**
 * Turns a day's calendar events into "which times can still be booked".
 * Pure functions — no network, no dates read from the clock except `now`.
 */

import type { CalendarEvent } from "./calendar.js";
import {
  APP_TAG,
  BLOCK_KEYWORD,
  DURATION_MINUTES,
  MIN_LEAD_MINUTES,
  OPENING_HOURS,
  SEATS_PER_SLOT,
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
 * Seats an event consumes. Bookings this app made carry an exact count;
 * anything you typed into Google Calendar yourself counts if its title starts
 * with a number, e.g. "4 Ana (telefon)". Everything else is treated as a note.
 */
function guestsOf(e: CalendarEvent): number {
  const props = e.extendedProperties?.private;
  if (props?.app === APP_TAG) return Number(props.guests) || 0;

  const match = /^\s*(\d{1,2})\b/.exec(e.summary ?? "");
  return match ? Number(match[1]) : 0;
}

function isBlock(e: CalendarEvent): boolean {
  return (e.summary ?? "").trim().toUpperCase().startsWith(BLOCK_KEYWORD);
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Seats still free if a party arrived at `time` on `dateStr`.
 * A reservation holds its seats for DURATION_MINUTES, so overlapping
 * bookings — not just ones starting at the same time — are counted.
 */
export function remainingSeats(dateStr: string, time: string, events: CalendarEvent[]): number {
  const window = {
    start: zagrebToUtc(dateStr, time).getTime(),
    end: zagrebToUtc(dateStr, addMinutes(time, DURATION_MINUTES)).getTime(),
  };

  let taken = 0;
  for (const e of events) {
    const range = rangeOf(e);
    if (!overlaps(window, range)) continue;
    if (isBlock(e)) return 0; // closed for this period
    taken += guestsOf(e);
  }

  return Math.max(0, SEATS_PER_SLOT - taken);
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
