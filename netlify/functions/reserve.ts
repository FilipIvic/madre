/**
 * POST /api/reserve
 *
 * Validates, re-checks capacity against the live calendar, writes the event,
 * then emails the guest and the restaurant.
 */

import { createReservation, listDayEvents } from "../lib/calendar.js";
import { APP_TAG, DURATION_MINUTES, isStaffEmail, missingEnv } from "../lib/config.js";
import { sendGuestConfirmation, sendOwnerNotification } from "../lib/email.js";
import { json } from "../lib/http.js";
import { cancelUrl, siteUrl } from "../lib/links.js";
import { isTooLate, remainingSeats } from "../lib/rules.js";
import { addMinutes } from "../lib/time.js";
import { validate } from "../lib/validate.js";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return json({ code: "METHOD_NOT_ALLOWED" }, 405);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ code: "BAD_REQUEST" }, 400);
  }

  const result = validate(body);
  if (result.ok === false) return json({ code: result.code }, 400);
  const r = result.value;

  if (isTooLate(r.date, r.time, new Date())) return json({ code: "TOO_LATE" }, 400);

  // Setup isn't finished yet — say which variables are missing rather than
  // returning an opaque 500. See SETUP-REZERVACIJE.md.
  const missing = missingEnv();
  if (missing.length > 0) {
    console.error("Not configured. Missing environment variables:", missing.join(", "));
    return json({ code: "NOT_CONFIGURED", missing }, 503);
  }

  const isStaff = isStaffEmail(r.email);

  try {
    const events = await listDayEvents(r.date);

    // Same person, same day — almost always a double-tap on the button.
    const duplicate = !isStaff && events.some(
      (e) =>
        e.extendedProperties?.private?.app === APP_TAG &&
        e.extendedProperties.private.email?.toLowerCase() === r.email.toLowerCase(),
    );
    if (duplicate) return json({ code: "DUPLICATE" }, 409);

    // Checked again here, right before writing: the slot may have filled up
    // while the guest was typing their name.
    if (remainingSeats(r.date, r.time, events) < r.guests) {
      return json({ code: "SLOT_FULL" }, 409);
    }

    const event = await createReservation({
      ...r,
      endTime: addMinutes(r.time, DURATION_MINUTES),
    });
    const links = { eventId: event.id, cancelUrl: cancelUrl(siteUrl(req), event.id, r.lang) };

    // A bounced email must not turn a confirmed booking into an error.
    if (!isStaff) {
      await Promise.allSettled([sendGuestConfirmation(r, links), sendOwnerNotification(r)]);
    }

    return json({ ok: true, date: r.date, time: r.time, guests: r.guests }, 201);
  } catch (error) {
    console.error("reserve failed:", error);
    return json({ code: "SERVER_ERROR" }, 500);
  }
};
