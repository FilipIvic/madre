import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import PrivacyPolicy from './PrivacyPolicy.tsx';
import TermsOfService from './TermsOfService.tsx';
import CookieConsent from './CookieConsent.tsx';
import './i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/politika-privatnosti" element={<PrivacyPolicy />} />
        <Route path="/uvjeti-koristenja" element={<TermsOfService />} />
      </Routes>
      <CookieConsent />
    </BrowserRouter>
  </StrictMode>,
);
