/**
 * Confirmation emails, sent from the restaurant's Gmail (RESTAURANT.email) over SMTP.
 * Gmail allows ~500 emails a day, far more than a bistro needs.
 *
 * Email is deliberately optional: with no GMAIL_APP_PASSWORD set, reservations
 * still work and this quietly does nothing. Set it up whenever you like.
 */

import nodemailer, { type SendMailOptions } from "nodemailer";
import { RESTAURANT } from "./config.js";
import { googleCalendarUrl, icsFile } from "./links.js";
import { formatDateHr } from "./time.js";
import type { ReservationInput } from "./validate.js";

const COPY = {
  hr: {
    subject: `Potvrda rezervacije — ${RESTAURANT.name}`,
    greeting: (name: string) => `Bok ${name},`,
    confirmed: "tvoja rezervacija je potvrđena. Veselimo se!",
    date: "Datum",
    time: "Vrijeme",
    guests: "Broj gostiju",
    notes: "Napomena",
    changeIntro: "Trebaš nešto promijeniti?",
    changeBody: `Nazovi nas na ${RESTAURANT.phoneDisplay} i sredit ćemo.`,
    holdNote: "Stol držimo 15 minuta od dogovorenog termina.",
    addToCalendar: "Dodaj u Google kalendar",
    icsNote: "Za Apple ili Outlook kalendar otvori privitak rezervacija.ics.",
    cancel: "Otkaži rezervaciju",
    calendarTitle: (guests: number) => `${RESTAURANT.name} — rezervacija (${guests} os.)`,
  },
  en: {
    subject: `Reservation confirmed — ${RESTAURANT.name}`,
    greeting: (name: string) => `Hi ${name},`,
    confirmed: "your reservation is confirmed. We look forward to it!",
    date: "Date",
    time: "Time",
    guests: "Guests",
    notes: "Note",
    changeIntro: "Need to change something?",
    changeBody: `Give us a call at ${RESTAURANT.phoneDisplay} and we'll sort it out.`,
    holdNote: "We hold your table for 15 minutes past the booked time.",
    addToCalendar: "Add to Google Calendar",
    icsNote: "For Apple or Outlook calendar, open the attached rezervacija.ics.",
    cancel: "Cancel reservation",
    calendarTitle: (guests: number) => `${RESTAURANT.name} — reservation (${guests} guests)`,
  },
};

type SendOptions = Pick<SendMailOptions, "replyTo" | "attachments">;

async function send(to: string, subject: string, html: string, { replyTo, attachments }: SendOptions = {}): Promise<void> {
  // Google shows app passwords as "abcd efgh ijkl mnop" — accept it with or without spaces.
  const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!password) {
    console.warn("GMAIL_APP_PASSWORD not set — skipping email to", to);
    return;
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: RESTAURANT.email, pass: password },
    // Stay well inside the function's time limit if Gmail is slow to answer.
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 8_000,
  });

  try {
    await transport.sendMail({
      from: { name: RESTAURANT.name, address: RESTAURANT.email },
      to,
      replyTo,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    // A failed email must never fail a confirmed booking — log and move on.
    console.error("Email to", to, "failed:", error instanceof Error ? error.message : error);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#56423d;font-size:14px;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#1f1b14;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
  </tr>`;
}

function button(href: string, label: string, primary: boolean): string {
  const colors = primary ? "background:#9a4025;color:#ffffff;" : "background:#f6ede4;color:#9a4025;";
  return `<a href="${escapeHtml(href)}" style="${colors}display:inline-block;padding:10px 18px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;margin:0 8px 8px 0;">${escapeHtml(label)}</a>`;
}

function shell(inner: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#fff8f3;padding:32px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h1 style="font-family:Georgia,serif;color:#9a4025;font-size:24px;margin:0 0 20px;">${RESTAURANT.name}</h1>
      ${inner}
      <p style="color:#56423d;font-size:12px;margin-top:28px;border-top:1px solid #f1e7dc;padding-top:16px;">
        ${escapeHtml(RESTAURANT.address)} · ${escapeHtml(RESTAURANT.phoneDisplay)}
      </p>
    </div>
  </div>`;
}

export async function sendGuestConfirmation(
  r: ReservationInput,
  links: { eventId: string; cancelUrl: string },
): Promise<void> {
  const t = COPY[r.lang];
  const entry = {
    eventId: links.eventId,
    date: r.date,
    time: r.time,
    title: t.calendarTitle(r.guests),
    details: `${t.guests}: ${r.guests}\n${RESTAURANT.phoneDisplay}\n\n${t.cancel}: ${links.cancelUrl}`,
  };
  const inner = `
    <p style="color:#1f1b14;font-size:15px;margin:0 0 4px;">${escapeHtml(t.greeting(r.name))}</p>
    <p style="color:#1f1b14;font-size:15px;margin:0 0 24px;">${t.confirmed}</p>
    <table style="border-collapse:collapse;margin-bottom:24px;">
      ${row(t.date, formatDateHr(r.date))}
      ${row(t.time, r.time)}
      ${row(t.guests, String(r.guests))}
      ${r.notes ? row(t.notes, r.notes) : ""}
    </table>
    <div style="margin-bottom:4px;">
      ${button(googleCalendarUrl(entry), t.addToCalendar, true)}
    </div>
    <p style="color:#56423d;font-size:12px;margin:0 0 24px;">${t.icsNote}</p>
    <p style="color:#56423d;font-size:13px;margin:0 0 4px;">${t.holdNote}</p>
    <p style="color:#56423d;font-size:13px;margin:0 0 16px;"><strong>${t.changeIntro}</strong> ${escapeHtml(t.changeBody)}</p>
    ${button(links.cancelUrl, t.cancel, false)}
  `;
  await send(r.email, t.subject, shell(inner), {
    attachments: [
      { filename: "rezervacija.ics", content: icsFile(entry), contentType: "text/calendar; charset=utf-8; method=PUBLISH" },
    ],
  });
}

export async function sendOwnerNotification(r: ReservationInput): Promise<void> {
  const to = process.env.OWNER_EMAIL || RESTAURANT.email;
  const inner = `
    <p style="color:#1f1b14;font-size:15px;margin:0 0 24px;">Nova rezervacija preko web stranice.</p>
    <table style="border-collapse:collapse;">
      ${row("Datum", formatDateHr(r.date))}
      ${row("Vrijeme", r.time)}
      ${row("Gostiju", String(r.guests))}
      ${row("Ime", r.name)}
      ${row("Telefon", r.phone)}
      ${row("Email", r.email)}
      ${r.notes ? row("Napomena", r.notes) : ""}
    </table>
  `;
  // Reply goes straight to the guest.
  await send(to, `Nova rezervacija: ${r.name}, ${r.guests} os. — ${formatDateHr(r.date)} u ${r.time}`, shell(inner), {
    replyTo: r.email,
  });
}

export type CancelledBooking = { date: string; time: string; guests: number; name: string; phone: string; email: string };

export async function sendOwnerCancellation(b: CancelledBooking): Promise<void> {
  const to = process.env.OWNER_EMAIL || RESTAURANT.email;
  const inner = `
    <p style="color:#1f1b14;font-size:15px;margin:0 0 24px;">Gost je otkazao rezervaciju preko linka iz emaila. Termin je ponovno slobodan i obrisan je iz kalendara.</p>
    <table style="border-collapse:collapse;">
      ${row("Datum", formatDateHr(b.date))}
      ${row("Vrijeme", b.time)}
      ${row("Gostiju", String(b.guests))}
      ${row("Ime", b.name)}
      ${row("Telefon", b.phone)}
      ${row("Email", b.email)}
    </table>
  `;
  await send(to, `Otkazano: ${b.name}, ${b.guests} os. — ${formatDateHr(b.date)} u ${b.time}`, shell(inner), {
    replyTo: b.email || undefined,
  });
}
