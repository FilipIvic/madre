import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import App from './App.tsx';
import PrivacyPolicy from './PrivacyPolicy.tsx';
import TermsOfService from './TermsOfService.tsx';
import CancelReservation from './CancelReservation.tsx';
import CookieConsent from './CookieConsent.tsx';
import './i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
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
