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
eq("last slot (close 23:00 - 60min)", wed[wed.length - 1], "22:00");
eq("slot count", wed.length, 23);
eq("Monday closed", slotsForDate("2026-09-14"), []);

// --- capacity --------------------------------------------------------------
const booking = (time: string, endTime: string, guests: number): CalendarEvent => ({
  id: time,
  summary: `${guests} os. — Test`,
  start: { dateTime: zagrebToUtc("2026-09-16", time).toISOString() },
  end: { dateTime: zagrebToUtc("2026-09-16", endTime).toISOString() },
  extendedProperties: { private: { app: "madre-reservations", guests: String(guests) } },
});

eq("empty day -> open", remainingSeats("2026-09-16", "12:30", []), 12);

// 4 guests at 12:30 closes 12:30 only — 12:00 and 13:00 stay open.
const four = [booking("12:30", "14:00", 4)];
eq("4 guests at 12:30 -> 12:30 taken", remainingSeats("2026-09-16", "12:30", four), 0);
eq("4 guests at 12:30 -> 13:00 open", remainingSeats("2026-09-16", "13:00", four), 12);
eq("4 guests at 12:30 -> 12:00 open", remainingSeats("2026-09-16", "12:00", four), 12);

// Up to 3 guests keeps the slot open; small bookings add up.
eq("3 guests at 12:30 -> still open", remainingSeats("2026-09-16", "12:30", [booking("12:30", "14:00", 3)]), 12);
eq("2 + 2 guests at 12:30 -> taken", remainingSeats("2026-09-16", "12:30", [booking("12:30", "14:00", 2), booking("12:30", "14:00", 2)]), 0);

// Manual entry typed straight into Google Calendar, title starting with a number.
const manual: CalendarEvent = {
  id: "m",
  summary: "6 Ana (telefon)",
  start: { dateTime: zagrebToUtc("2026-09-16", "19:00").toISOString() },
  end: { dateTime: zagrebToUtc("2026-09-16", "20:30").toISOString() },
};
eq("manual entry counts", remainingSeats("2026-09-16", "19:00", [manual]), 0);
eq("manual entry doesn't close next slot", remainingSeats("2026-09-16", "19:30", [manual]), 12);

// An off-grid manual time (19:15) counts toward the slot it falls in.
const offGrid: CalendarEvent = { ...manual, id: "o", start: { dateTime: zagrebToUtc("2026-09-16", "19:15").toISOString() } };
eq("19:15 entry counts in 19:00 slot", remainingSeats("2026-09-16", "19:00", [offGrid]), 0);

// The way bookings have always been written by hand.
const titled = (summary: string): CalendarEvent => ({
  id: summary,
  summary,
  start: { dateTime: zagrebToUtc("2026-09-16", "12:30").toISOString() },
  end: { dateTime: zagrebToUtc("2026-09-16", "13:30").toISOString() },
});
eq("'Rezervacija 4 osobe - Josipa' counts 4", remainingSeats("2026-09-16", "12:30", [titled("Rezervacija 4 osobe - Josipa")]), 0);
eq("'Rezervacija 2 osobe - Anna' counts 2", remainingSeats("2026-09-16", "12:30", [titled("Rezervacija 2 osobe - Anna Kotyk")]), 12);
eq("'rezervacija: 5 ljudi' counts 5", remainingSeats("2026-09-16", "12:30", [titled("rezervacija: 5 ljudi")]), 0);
eq("two handwritten 2s add up", remainingSeats("2026-09-16", "12:30", [titled("Rezervacija 2 osobe - A"), titled("Rezervacija 2 osobe - B")]), 0);
eq("'Rezervacija' without number is a note", remainingSeats("2026-09-16", "12:30", [titled("Rezervacija - Josipa")]), 12);

// A note without a leading number consumes nothing.
const note: CalendarEvent = {
  id: "n",
  summary: "dostava vina",
  start: { dateTime: zagrebToUtc("2026-09-16", "19:00").toISOString() },
  end: { dateTime: zagrebToUtc("2026-09-16", "20:00").toISOString() },
};
eq("plain note ignored", remainingSeats("2026-09-16", "19:00", [note]), 12);

// ZATVORENO all-day event closes the whole day.
const closed: CalendarEvent = {
  id: "c",
  summary: "ZATVORENO — privatna zabava",
  start: { date: "2026-09-16" },
  end: { date: "2026-09-17" },
};
eq("all-day block at 11:00", remainingSeats("2026-09-16", "11:00", [closed]), 0);
eq("all-day block at 21:30", remainingSeats("2026-09-16", "21:30", [closed]), 0);
eq("block does not leak to next day", remainingSeats("2026-09-17", "19:00", [closed]), 12);

// A timed block 20:00–22:00 also closes slots whose table would run into it.
const evening: CalendarEvent = {
  id: "e",
  summary: "ZATVORENO",
  start: { dateTime: zagrebToUtc("2026-09-16", "20:00").toISOString() },
  end: { dateTime: zagrebToUtc("2026-09-16", "22:00").toISOString() },
};
eq("timed block closes 19:30 (table runs past 20:00)", remainingSeats("2026-09-16", "19:30", [evening]), 0);
eq("timed block leaves 19:00 open (table done by 20:00)", remainingSeats("2026-09-16", "19:00", [evening]), 12);

// --- lead time -------------------------------------------------------------
const now = new Date("2026-09-16T16:10:00Z"); // 18:10 Zagreb (CEST)
eq("19:00 too late at 18:10 (<60min)", isTooLate("2026-09-16", "19:00", now), true);
eq("19:30 still bookable at 18:10", isTooLate("2026-09-16", "19:30", now), false);
eq("past slot is too late", isTooLate("2026-09-16", "12:00", now), true);

const slots = availability("2026-09-16", [booking("19:30", "21:00", 6)], now);
eq("availability hides past slots", slots[0].time, "19:30");
eq("availability marks taken slot", slots[0].remaining, 0);
eq("availability keeps next slot open", slots[1].remaining, 12);

console.log(failed === 0 ? "\nALL PASSED" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
