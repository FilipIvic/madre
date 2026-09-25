import { useCallback, useSyncExternalStore } from "react";
import hr from "./locales/hr";
import en from "./locales/en";

/**
 * Two languages, one file. Croatian is the default; English is used when a guest
 * picks it (remembered in localStorage) or arrives from an English email with ?lng=en.
 * Crawlers always get Croatian, the market the site is for.
 */
export type Lang = "hr" | "en";

const resources: Record<Lang, object> = { hr, en };

function asLang(value: string | null | undefined): Lang | undefined {
  return value === "hr" || value === "en" ? value : undefined;
}

function initialLanguage(): Lang {
  const fromUrl = asLang(new URLSearchParams(window.location.search).get("lng"));
  if (fromUrl) return fromUrl;
  try {
    const saved = asLang(localStorage.getItem("lang"));
    if (saved) return saved;
  } catch {
    // Storage blocked — fall through to the default.
  }
  return "hr";
}

let language: Lang = initialLanguage();
const listeners = new Set<() => void>();
// Screen readers and search engines read the page language from <html lang>.
document.documentElement.lang = language;

export function changeLanguage(next: Lang) {
  if (next === language) return;
  language = next;
  document.documentElement.lang = next;
  try {
    localStorage.setItem("lang", next);
  } catch {
    // Storage blocked — the language still switches for this visit.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

function lookup(lang: Lang, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined), resources[lang]);
}

/**
 * `t("menu.headline")` reads a nested key; `t("footer.copyright", { year })` fills `{{year}}`;
 * `t("reserve.errors.X", fallbackText)` returns the fallback when the key is missing.
 */
export function useTranslation() {
  const lang = useSyncExternalStore(subscribe, () => language);
  // Stable per language: components list `t` in effect dependencies, so a new function
  // on every render would re-run their fetches endlessly.
  const t = useCallback((key: string, varsOrFallback?: Record<string, string | number> | string): string => {
    const raw = lookup(lang, key) ?? lookup("hr", key);
    if (typeof raw !== "string") return typeof varsOrFallback === "string" ? varsOrFallback : key;
    const vars = typeof varsOrFallback === "object" ? varsOrFallback : undefined;
    return vars ? raw.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars[name] ?? "")) : raw;
  }, [lang]);
  return { t, i18n: { language: lang, changeLanguage } };
}
