import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import App from './App.tsx';
import PrivacyPolicy from './PrivacyPolicy.tsx';
import TermsOfService from './TermsOfService.tsx';
import CancelReservation from './CancelReservation.tsx';
import CookieConsent from './CookieConsent.tsx';
import './i18n';
import './index.css';

/**
 * Start each new page at the top — the router keeps the old scroll position otherwise,
 * so a footer link opened the privacy policy scrolled to its end. The reservation modal
 * sits over the home page, so opening or closing it doesn't count as a new page, and
 * Back/Forward is left to the browser, which restores where you were.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const path = pathname.replace(/\/+$/, '') || '/';
  const page = path === '/rezervacija' ? '/' : path;
  const previous = useRef(page);

  useEffect(() => {
    if (page !== previous.current && navigationType !== 'POP') {
      // Instant: the smooth scrolling set in index.css would visibly glide up the new page.
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    previous.current = page;
  }, [page, navigationType]);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/rezervacija" element={<App />} />
          <Route path="/politika-privatnosti" element={<PrivacyPolicy />} />
          <Route path="/uvjeti-koristenja" element={<TermsOfService />} />
          <Route path="/otkazivanje" element={<CancelReservation />} />
          {/* Typos and old links land on the home page instead of a blank screen. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
