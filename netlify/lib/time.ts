/**
 * Timezone helpers.
 *
 * Everything the guest sees is Zagreb local time. Everything Google Calendar
 * gets asked about is UTC. These four functions are the only place that
 * conversion happens, so there is exactly one thing to get right.
 */

export const TZ = "Europe/Zagreb";

/** How far `timeZone` is ahead of UTC at the given instant, in milliseconds. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const p: Record<string, string> = {};
  for (const part of parts) p[part.type] = part.value;

  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute),
    Number(p.second),
  );
  return asUtc - date.getTime();
}

/**
 * "2026-09-20" + "19:30" as wall-clock Zagreb time -> the real UTC instant.
 * Applied twice so the hour around a DST switch still lands correctly.
 */
export function zagrebToUtc(dateStr: string, timeStr: string): Date {
  const naiveMs = Date.parse(`${dateStr}T${timeStr}:00Z`);
  const firstGuess = new Date(naiveMs - tzOffsetMs(new Date(naiveMs), TZ));
  return new Date(naiveMs - tzOffsetMs(firstGuess, TZ));
}

/** Today in Zagreb as "YYYY-MM-DD" — not the server's date. */
export function zagrebToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** Current Zagreb wall-clock time as "HH:MM". */
export function zagrebNowTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/** A UTC instant (e.g. an event's start) as Zagreb wall-clock "YYYY-MM-DD" + "HH:MM". */
export function zagrebDateTime(instant: string | Date): { date: string; time: string } {
  const d = new Date(instant);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return { date, time };
}

/** Day of week for a "YYYY-MM-DD" date. 0 = Sunday. */
export function weekdayOf(dateStr: string): number {
  // Noon UTC is the same calendar day in Zagreb year-round (offset is +1 or +2).
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

/** Add minutes to a "HH:MM" string. Returns "HH:MM". */
export function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** "HH:MM" -> minutes since midnight. */
export function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/** "2026-09-20" -> "20.09.2026." for humans. */
export function formatDateHr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}.`;
}

/** "2026-09-20" -> "2026-09-21". */
export function nextDay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Whole days between two "YYYY-MM-DD" dates (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}
