/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CalendarCheck, Loader2, Phone, Users } from "lucide-react";
import { MAX_DAYS_AHEAD, MAX_PARTY_SIZE, RESTAURANT, isStaffEmail } from "../netlify/lib/config";

type Slot = { time: string; remaining: number };

/**
 * Zagreb calendar date as YYYY-MM-DD, which is what <input type="date"> wants.
 * Not the visitor's own date — a guest browsing from another time zone would
 * otherwise be offered a day the restaurant already considers past.
 */
function isoDate(offsetDays = 0): string {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Name, phone and email from the last successful booking on this device. */
const SAVED_GUEST_KEY = "madre-guest";
type SavedGuest = { name?: string; phone?: string; email?: string };

function loadSavedGuest(): SavedGuest {
  try {
    return JSON.parse(localStorage.getItem(SAVED_GUEST_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

/** "2026-09-20" -> "20.09.2026." */
function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

const fieldClass =
  "w-full rounded-xl border border-surface-container-high bg-surface-container-low px-4 py-3 " +
  "font-body text-on-surface placeholder:text-secondary/60 outline-none transition-colors " +
  "focus:border-primary focus:ring-1 focus:ring-primary";

const labelClass = "block font-body text-xs font-bold uppercase tracking-widest text-secondary mb-2";

const ReservationForm = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("hr") ? "hr" : "en";

  const [date, setDate] = useState(isoDate());
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [closed, setClosed] = useState(false);

  const [saved] = useState(loadSavedGuest);
  const [name, setName] = useState(saved.name ?? "");
  const [phone, setPhone] = useState(saved.phone ?? "");
  const [email, setEmail] = useState(saved.email ?? "");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const isStaff = isStaffEmail(email);

  // Reload slots whenever the guest picks a different day.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingSlots(true);
      setError("");
      setTime("");

      try {
        const res = await fetch(`/api/availability?date=${date}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setSlots([]);
          setClosed(true);
          setError(t(`reserve.errors.${data.code ?? "SERVER_ERROR"}`, t("reserve.errors.SERVER_ERROR")));
          return;
        }

        setSlots(data.slots ?? []);
        setClosed(Boolean(data.closed));
      } catch {
        if (!cancelled) {
          setSlots([]);
          setError(t("reserve.errors.NETWORK"));
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [date, t]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, guests, name, phone, email, notes, company, lang }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(t(`reserve.errors.${data.code ?? "SERVER_ERROR"}`, t("reserve.errors.SERVER_ERROR")));
        // The slot filled up while they were typing — refresh what is left.
        if (data.code === "SLOT_FULL") {
          const refreshed = await fetch(`/api/availability?date=${date}`).then((r) => r.json());
          setSlots(refreshed.slots ?? []);
          setTime("");
        }
        return;
      }

      // Staff log bookings for other people — don't prefill the next one with this guest.
      if (!isStaff) {
        try {
          localStorage.setItem(
            SAVED_GUEST_KEY,
            JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim() }),
          );
        } catch {
          // Private mode or storage blocked — remembering is only a convenience.
        }
      }
      setDone(true);
    } catch {
      setError(t("reserve.errors.NETWORK"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div
        className="text-center py-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CalendarCheck size={44} className="mx-auto text-primary mb-5" />
        <h3 className="font-headline text-2xl text-primary mb-3">{t("reserve.successHeadline")}</h3>
        <p className="font-body text-sm text-on-surface-variant mb-2">
          {t(isStaff ? "reserve.successStaff" : "reserve.successBody", { date: prettyDate(date), time, guests })}
        </p>
        {!isStaff && <p className="font-body text-xs text-secondary opacity-80">{t("reserve.successHold")}</p>}
      </motion.div>
    );
  }

  const canSubmit = Boolean(time && name.trim() && (phone.trim() || isStaff) && email.trim()) && !submitting;

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {/* Date + party size — stacked on phones: iOS Safari's native date field won't shrink to half the width. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="min-w-0">
          <label className={labelClass} htmlFor="res-date">
            {t("reserve.dateLabel")}
          </label>
          <input
            id="res-date"
            type="date"
            required
            value={date}
            min={isoDate()}
            max={isoDate(MAX_DAYS_AHEAD)}
            onChange={(e) => setDate(e.target.value)}
            className={`${fieldClass} block min-w-0`}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="res-guests">
            {t("reserve.guestsLabel")}
          </label>
          <div className="relative">
            <select
              id="res-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={`${fieldClass} appearance-none pr-10`}
            >
              {Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <Users
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary"
            />
          </div>
        </div>
      </div>

      {/* Time slots */}
      <div>
        <label className={labelClass}>{t("reserve.timeLabel")}</label>

        {loadingSlots ? (
          <div className="flex items-center gap-2 py-3 font-body text-sm text-secondary">
            <Loader2 size={16} className="animate-spin" />
            {t("reserve.loadingSlots")}
          </div>
        ) : closed || slots.length === 0 ? (
          <p className="rounded-xl bg-surface-container px-4 py-3 font-body text-sm text-on-surface-variant">
            {t("reserve.noSlots")}
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => {
              const full = slot.remaining < guests;
              const active = slot.time === time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={full}
                  onClick={() => setTime(slot.time)}
                  className={`rounded-lg px-2 py-2.5 font-body text-sm font-bold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : full
                        ? "cursor-not-allowed bg-surface-container text-secondary/40 line-through"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Guest details */}
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelClass} htmlFor="res-name">
            {t("reserve.nameLabel")}
          </label>
          <input
            id="res-name"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            autoComplete="name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="res-phone">
              {t("reserve.phoneLabel")}
            </label>
            <input
              id="res-phone"
              type="tel"
              required={!isStaff}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
              autoComplete="tel"
              placeholder="+385 91 234 5678"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="res-email">
              {t("reserve.emailLabel")}
            </label>
            <input
              id="res-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="res-notes">
            {t("reserve.notesLabel")}
          </label>
          <textarea
            id="res-notes"
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("reserve.notesPlaceholder")}
            className={`${fieldClass} resize-none`}
          />
        </div>
      </div>

      {/* Bots fill every field they can find; people never see this one. */}
      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {error && (
        <p className="rounded-xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">{error}</p>
      )}

      {/* On phones the button stays pinned to the bottom of the sheet while the guest scrolls. */}
      <div className="sticky bottom-0 z-10 -mx-6 px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-surface shadow-[0_-12px_16px_-12px_rgba(0,0,0,0.12)] sm:static sm:z-auto sm:m-0 sm:p-0 sm:bg-transparent sm:shadow-none">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-body font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? t("reserve.submitting") : t("reserve.submit")}
        </button>
      </div>

      <p className="text-center font-body text-xs text-secondary opacity-80">
        {t("reserve.largePartyNote", { max: MAX_PARTY_SIZE })}{" "}
        <a href={`tel:${RESTAURANT.phone}`} className="inline-flex items-center gap-1 font-bold text-primary">
          <Phone size={12} /> {RESTAURANT.phoneDisplay}
        </a>
      </p>
    </form>
  );
};

export default ReservationForm;
