/**
 * GET  /api/cancel?id=…&t=…   → the booking behind a cancel link, so the page can show it
 * POST /api/cancel {id, t}     → deletes it from the calendar and tells the restaurant
 *
 * Two steps on purpose: some mail providers open every link in an email to scan
 * it, and that must never cancel a reservation. Only the button on the page does.
 */

import { APP_TAG, missingEnv } from "../lib/config.js";
import { deleteEvent, getEvent } from "../lib/calendar.js";
import { sendOwnerCancellation } from "../lib/email.js";
import { json } from "../lib/http.js";
import { EVENT_ID_RE, isValidCancelToken } from "../lib/links.js";
import { zagrebDateTime } from "../lib/time.js";

async function readLink(req: Request): Promise<{ id: string; token: string }> {
  if (req.method === "GET") {
    const params = new URL(req.url).searchParams;
    return { id: params.get("id") ?? "", token: params.get("t") ?? "" };
  }
  try {
    const body = await req.json();
    return { id: String(body?.id ?? ""), token: String(body?.t ?? "") };
  } catch {
    return { id: "", token: "" };
  }
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET" && req.method !== "POST") return json({ code: "METHOD_NOT_ALLOWED" }, 405);

  const missing = missingEnv();
  if (missing.length > 0) {
    console.error("Not configured. Missing environment variables:", missing.join(", "));
    return json({ code: "NOT_CONFIGURED", missing }, 503);
  }

  const { id, token } = await readLink(req);
  if (!EVENT_ID_RE.test(id) || !isValidCancelToken(id, token)) return json({ code: "INVALID_LINK" }, 400);

  try {
    const event = await getEvent(id);
    const props = event?.extendedProperties?.private;
    // Only bookings this app made can be cancelled by link.
    if (!event?.start.dateTime || props?.app !== APP_TAG) return json({ code: "NOT_FOUND" }, 404);

    const { date, time } = zagrebDateTime(event.start.dateTime);
    const booking = { date, time, guests: Number(props.guests) || 0, name: props.name ?? "" };

    if (Date.parse(event.start.dateTime) <= Date.now()) return json({ code: "ALREADY_STARTED", ...booking }, 409);
    if (req.method === "GET") return json(booking);

    await deleteEvent(id);
    await Promise.allSettled([
      sendOwnerCancellation({ ...booking, phone: props.phone ?? "", email: props.email ?? "" }),
    ]);

    return json({ ok: true, ...booking });
  } catch (error) {
    console.error("cancel failed:", error);
    return json({ code: "SERVER_ERROR" }, 500);
  }
};
