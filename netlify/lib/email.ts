/**
 * Confirmation emails via Resend (free tier covers a bistro many times over).
 *
 * Email is deliberately optional: with no RESEND_API_KEY set, reservations
 * still work and this quietly does nothing. Set it up whenever you like.
 */

import { RESTAURANT } from "./config.js";
import { formatDateHr } from "./time.js";
import type { ReservationInput } from "./validate.js";

const ENDPOINT = "https://api.resend.com/emails";

const COPY = {
  hr: {
    subject: `Potvrda rezervacije — ${RESTAURANT.name}`,
    greeting: (name: string) => `Bok ${name},`,
    confirmed: "tvoja rezervacija je potvrđena. Veselimo se!",
    date: "Datum",
    time: "Vrijeme",
    guests: "Broj gostiju",
    notes: "Napomena",
    changeIntro: "Trebaš promijeniti ili otkazati?",
    changeBody: `Nazovi nas na ${RESTAURANT.phoneDisplay} i sredit ćemo.`,
    holdNote: "Stol držimo 15 minuta od dogovorenog termina.",
  },
  en: {
    subject: `Reservation confirmed — ${RESTAURANT.name}`,
    greeting: (name: string) => `Hi ${name},`,
    confirmed: "your reservation is confirmed. We look forward to it!",
    date: "Date",
    time: "Time",
    guests: "Guests",
    notes: "Note",
    changeIntro: "Need to change or cancel?",
    changeBody: `Give us a call at ${RESTAURANT.phoneDisplay} and we'll sort it out.`,
    holdNote: "We hold your table for 15 minutes past the booked time.",
  },
};

async function send(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email to", to);
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? `${RESTAURANT.name} <onboarding@resend.dev>`,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    // A failed email must never fail a confirmed booking — log and move on.
    console.error("Resend error:", res.status, (await res.text()).slice(0, 300));
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

export async function sendGuestConfirmation(r: ReservationInput): Promise<void> {
  const t = COPY[r.lang];
  const inner = `
    <p style="color:#1f1b14;font-size:15px;margin:0 0 4px;">${escapeHtml(t.greeting(r.name))}</p>
    <p style="color:#1f1b14;font-size:15px;margin:0 0 24px;">${t.confirmed}</p>
    <table style="border-collapse:collapse;margin-bottom:24px;">
      ${row(t.date, formatDateHr(r.date))}
      ${row(t.time, r.time)}
      ${row(t.guests, String(r.guests))}
      ${r.notes ? row(t.notes, r.notes) : ""}
    </table>
    <p style="color:#56423d;font-size:13px;margin:0 0 4px;">${t.holdNote}</p>
    <p style="color:#56423d;font-size:13px;margin:0;"><strong>${t.changeIntro}</strong> ${escapeHtml(t.changeBody)}</p>
  `;
  await send(r.email, t.subject, shell(inner));
}

export async function sendOwnerNotification(r: ReservationInput): Promise<void> {
  const to = process.env.OWNER_EMAIL ?? RESTAURANT.email;
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
  await send(to, `Nova rezervacija: ${r.name}, ${r.guests} os. — ${formatDateHr(r.date)} u ${r.time}`, shell(inner));
}
