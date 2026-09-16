import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import hr from "./locales/hr";
import en from "./locales/en";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      hr: { translation: hr },
      en: { translation: en },
    },
    fallbackLng: "hr",
    supportedLngs: ["hr", "en"],
    detection: {
      // ?lng=en comes from the cancel link, so the page matches the guest's email.
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lng",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Screen readers and search engines read the page language from <html lang>.
document.documentElement.lang = i18n.resolvedLanguage ?? "hr";
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng.startsWith("en") ? "en" : "hr";
});

export default i18n;
