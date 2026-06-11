/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const STORAGE_KEY = "madre-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GDPR cookie-consent banner.
 *
 * Google Analytics defaults to `analytics_storage: denied` in index.html, so
 * nothing is tracked until the visitor explicitly accepts here. The choice is
 * stored in localStorage; the early script in index.html re-grants consent on
 * the next visit before this component mounts.
 */
const CookieConsent = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const choice = localStorage.getItem(STORAGE_KEY);
      if (choice !== "granted" && choice !== "denied") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (granted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
    } catch {
      /* storage blocked — honour the choice for this session only */
    }
    window.gtag?.("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-surface border border-surface-container-high shadow-2xl rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="font-body text-sm text-on-surface-variant flex-1">
          {t("consent.text")}{" "}
          <Link
            to="/politika-privatnosti"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {t("consent.learnMore")}
          </Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => decide(false)}
            className="px-5 py-2.5 rounded-lg font-bold text-sm text-secondary border border-surface-container-high hover:bg-surface-container transition-colors"
          >
            {t("consent.decline")}
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-95"
          >
            {t("consent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
