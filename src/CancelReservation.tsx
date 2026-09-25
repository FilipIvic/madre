import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "./i18n";
import { ArrowLeft, CalendarX, Loader2, Phone } from "lucide-react";

const PHONE = "+385953545315";
const PHONE_DISPLAY = "+385 95 35 45 315";

type Booking = { date: string; time: string; guests: number; name: string };

/** "2026-09-20" -> "20.09.2026." */
function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

type State =
  | { step: "loading" }
  | { step: "confirm"; booking: Booking }
  | { step: "cancelling"; booking: Booking }
  | { step: "done"; booking: Booking }
  | { step: "error"; code: string; booking?: Booking };

export default function CancelReservation() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const token = params.get("t") ?? "";
  const [state, setState] = useState<State>({ step: "loading" });

  // Only look the booking up — cancelling needs the button below.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cancel?${new URLSearchParams({ id, t: token })}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setState({ step: "confirm", booking: data });
        else setState({ step: "error", code: data.code ?? "SERVER_ERROR", booking: data.date ? data : undefined });
      })
      .catch(() => !cancelled && setState({ step: "error", code: "NETWORK" }));
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const confirm = async (booking: Booking) => {
    setState({ step: "cancelling", booking });
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, t: token }),
      });
      const data = await res.json();
      setState(res.ok ? { step: "done", booking } : { step: "error", code: data.code ?? "SERVER_ERROR", booking });
    } catch {
      setState({ step: "error", code: "NETWORK", booking });
    }
  };

  const summary = (b: Booking) =>
    t("cancel.summary", { name: b.name, guests: b.guests, date: prettyDate(b.date), time: b.time });

  const errorText = (code: string) =>
    t(`cancel.errors.${code}`, t(`reserve.errors.${code}`, t("reserve.errors.SERVER_ERROR")));

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto px-6 py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-12 hover:gap-4 transition-all"
        >
          <ArrowLeft size={16} /> {t("cancel.back")}
        </Link>

        <h1 className="font-headline text-4xl text-primary mb-8">{t("cancel.headline")}</h1>

        <div className="rounded-2xl bg-surface-container-low p-8 font-body text-on-surface-variant">
          {state.step === "loading" && (
            <p className="flex items-center gap-2 text-sm text-secondary">
              <Loader2 size={16} className="animate-spin" /> {t("cancel.loading")}
            </p>
          )}

          {(state.step === "confirm" || state.step === "cancelling") && (
            <>
              <p className="font-headline text-xl text-on-surface mb-2">{summary(state.booking)}</p>
              <p className="text-sm mb-8">{t("cancel.question")}</p>
              <button
                type="button"
                onClick={() => confirm(state.booking)}
                disabled={state.step === "cancelling"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {state.step === "cancelling" && <Loader2 size={18} className="animate-spin" />}
                {state.step === "cancelling" ? t("cancel.cancelling") : t("cancel.confirm")}
              </button>
              <Link to="/" className="mt-4 block text-center text-sm text-secondary hover:text-primary">
                {t("cancel.keep")}
              </Link>
            </>
          )}

          {state.step === "done" && (
            <div className="text-center">
              <CalendarX size={44} className="mx-auto text-primary mb-5" />
              <p className="font-headline text-2xl text-primary mb-3">{t("cancel.doneHeadline")}</p>
              <p className="text-sm mb-1">{summary(state.booking)}</p>
              <p className="text-sm mb-8">{t("cancel.doneBody")}</p>
              <Link
                to="/rezervacija"
                className="inline-block rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:opacity-90"
              >
                {t("cancel.bookAgain")}
              </Link>
            </div>
          )}

          {state.step === "error" && (
            <>
              {state.booking && <p className="font-headline text-xl text-on-surface mb-2">{summary(state.booking)}</p>}
              <p className="text-sm mb-6">{errorText(state.code)}</p>
              <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 font-bold text-primary">
                <Phone size={16} /> {PHONE_DISPLAY}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
