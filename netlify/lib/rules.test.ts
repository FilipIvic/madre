import { zagrebToUtc, weekdayOf, addMinutes, nextDay, daysBetween, formatDateHr } from "./time.js";
import { slotsForDate, remainingSeats, availability, isTooLate } from "./rules.js";
import type { CalendarEvent } from "./calendar.js";

let failed = 0;
function eq(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`, ok ? "" : `\n      got: ${JSON.stringify(actual)}\n      want: ${JSON.stringify(expected)}`);
}

// --- timezone --------------------------------------------------------------
// Summer (CEST, UTC+2): 19:00 Zagreb == 17:00 UTC
eq("summer 19:00 -> UTC", zagrebToUtc("2026-07-15", "19:00").toISOString(), "2026-07-15T17:00:00.000Z");
// Winter (CET, UTC+1): 19:00 Zagreb == 18:00 UTC
eq("winter 19:00 -> UTC", zagrebToUtc("2026-01-15", "19:00").toISOString(), "2026-01-15T18:00:00.000Z");
// Day of DST switch forward (2026-03-29): 12:00 local is UTC+2 already
eq("DST-forward day noon", zagrebToUtc("2026-03-29", "12:00").toISOString(), "2026-03-29T10:00:00.000Z");
// Day of DST switch back (2026-10-25): 12:00 local is UTC+1
eq("DST-back day noon", zagrebToUtc("2026-10-25", "12:00").toISOString(), "2026-10-25T11:00:00.000Z");

eq("weekday 2026-09-16 = Wed(3)", weekdayOf("2026-09-16"), 3);
eq("weekday 2026-09-14 = Mon(1)", weekdayOf("2026-09-14"), 1);
eq("addMinutes 21:30+90", addMinutes("21:30", 90), "23:00");
eq("nextDay month rollover", nextDay("2026-09-30"), "2026-10-01");
eq("daysBetween across DST", daysBetween("2026-10-24", "2026-10-26"), 2);
eq("formatDateHr", formatDateHr("2026-09-20"), "20.09.2026.");

// --- slots -----------------------------------------------------------------
const wed = slotsForDate("2026-09-16");
eq("first slot", wed[0], "11:00");
eq("last slot (close 23:00 - 90min)", wed[wed.length - 1], "21:30");
eq("slot count", wed.length, 22);
eq("Monday closed", slotsForDate("2026-09-14"), []);

// --- capacity --------------------------------------------------------------
const booking = (time: string, endTime: string, guests: number): CalendarEvent => ({
  id: time,
  summary: `${guests} os. — Test`,
  start: { dateTime: zagrebToUtc("2026-09-16", time).toISOString() },
  end: { dateTime: zagrebToUtc("2026-09-16", endTime).toISOString() },
  extendedProperties: { private: { app: "madre-reservations", guests: String(guests) } },
});

eq("empty day -> full capacity", remainingSeats("2026-09-16", "19:00", []), 30);

// A 19:00-20:30 booking of 10 must reduce 19:00, 19:30 and 20:00 alike.
const one = [booking("19:00", "20:30", 10)];
eq("overlap at 19:00", remainingSeats("2026-09-16", "19:00", one), 20);
eq("overlap at 20:00", remainingSeats("2026-09-16", "20:00", one), 20);
eq("no overlap at 20:30", remainingSeats("2026-09-16", "20:30", one), 30);
eq("no overlap at 17:00", remainingSeats("2026-09-16", "17:00", one), 30);

// Manual entry typed straight into Google Calendar, title starting with a number.
const manual: CalendarEvent = {
  id: "m",
  summary: "6 Ana (telefon)",
  start: { dateTime: zagrebToUtc("2026-09-16", "19:00").toISOString() },
  end: { dateTime: zagrebToUtc("2026-09-16", "20:30").toISOString() },
};
eq("manual entry counts", remainingSeats("2026-09-16", "19:00", [...one, manual]), 14);

// A note without a leading number consumes nothing.
const note: CalendarEvent = {
  id: "n",
  summary: "dostava vina",
  start: { dateTime: zagrebToUtc("2026-09-16", "19:00").toISOString() },
  end: { dateTime: zagrebToUtc("2026-09-16", "20:00").toISOString() },
};
eq("plain note ignored", remainingSeats("2026-09-16", "19:00", [note]), 30);

// ZATVORENO all-day event closes the whole day.
const closed: CalendarEvent = {
  id: "c",
  summary: "ZATVORENO — privatna zabava",
  start: { date: "2026-09-16" },
  end: { date: "2026-09-17" },
};
eq("all-day block at 11:00", remainingSeats("2026-09-16", "11:00", [closed]), 0);
eq("all-day block at 21:30", remainingSeats("2026-09-16", "21:30", [closed]), 0);
eq("block does not leak to next day", remainingSeats("2026-09-17", "19:00", [closed]), 30);

// --- lead time -------------------------------------------------------------
const now = new Date("2026-09-16T16:10:00Z"); // 18:10 Zagreb (CEST)
eq("19:00 too late at 18:10 (<60min)", isTooLate("2026-09-16", "19:00", now), true);
eq("19:30 still bookable at 18:10", isTooLate("2026-09-16", "19:30", now), false);
eq("past slot is too late", isTooLate("2026-09-16", "12:00", now), true);

const slots = availability("2026-09-16", one, now);
eq("availability hides past slots", slots[0].time, "19:30");
eq("availability carries remaining", slots[0].remaining, 20);

console.log(failed === 0 ? "\nALL PASSED" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
