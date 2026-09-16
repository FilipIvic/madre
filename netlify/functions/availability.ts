/**
 * GET /api/availability?date=YYYY-MM-DD
 *
 * Free time slots for one day. Safe to call as often as the form likes.
 */

import { listDayEvents } from "../lib/calendar.js";
import { MAX_DAYS_AHEAD, MAX_PARTY_SIZE, missingEnv } from "../lib/config.js";
import { json } from "../lib/http.js";
import { availability } from "../lib/rules.js";
import { daysBetween, zagrebToday } from "../lib/time.js";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") return json({ code: "METHOD_NOT_ALLOWED" }, 405);

  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ code: "INVALID_DATE" }, 400);

  const offset = daysBetween(zagrebToday(), date);
  if (offset < 0 || offset > MAX_DAYS_AHEAD) return json({ code: "INVALID_DATE" }, 400);

  // Setup isn't finished yet — say which variables are missing rather than
  // returning an opaque 500. See SETUP-REZERVACIJE.md.
  const missing = missingEnv();
  if (missing.length > 0) {
    console.error("Not configured. Missing environment variables:", missing.join(", "));
    return json({ code: "NOT_CONFIGURED", missing }, 503);
  }

  try {
    const events = await listDayEvents(date);
    const slots = availability(date, events, new Date());

    return json({
      date,
      maxPartySize: MAX_PARTY_SIZE,
      // Closed day, fully booked, or everything left is too soon to book online.
      closed: slots.length === 0,
      slots,
    });
  } catch (error) {
    console.error("availability failed:", error);
    return json({ code: "SERVER_ERROR" }, 500);
  }
};
