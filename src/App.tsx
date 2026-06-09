/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Instagram,
  Menu as MenuIcon,
  X,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// --- Language Switcher ---

const LanguageSwitcher = ({ light = false }: { light?: boolean }) => {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("hr") ? "hr" : "en";

  const activeClass = light ? "text-white" : "text-primary";
  const inactiveClass = light ? "text-white/70 hover:text-white" : "text-secondary hover:text-primary";

  return (
    <div className="flex items-center gap-1 text-xs font-bold font-body">
      <button
        type="button"
        onClick={() => i18n.changeLanguage("hr")}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${current === "hr" ? activeClass : inactiveClass}`}
      >
        <span className="text-base leading-none">🇭🇷</span> HR
      </button>
      <span className={`opacity-40 ${light ? "text-white" : "text-secondary"}`}>|</span>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${current === "en" ? activeClass : inactiveClass}`}
      >
        <span className="text-base leading-none">🇬🇧</span> EN
      </button>
    </div>
  );
};

// --- Reservation Modal ---

const ReservationModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const phone = "+385953545315";
  const email = "madre.split@gmail.com";
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(t("modal.emailSubject"))}`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Card */}
      <motion.div
        className="relative bg-surface rounded-2xl shadow-2xl p-8 w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="font-headline text-2xl text-primary mb-2">{t("modal.headline")}</h2>
        <p className="font-body text-sm text-on-surface-variant mb-8">
          {t("modal.body")}
        </p>

        <div className="flex flex-col gap-4">
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-4 bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <Phone size={20} />
            <div>
              <div className="text-sm uppercase tracking-widest opacity-80 font-body font-normal">{t("modal.callLabel")}</div>
              <div className="font-headline">+385 95 35 45 315</div>
            </div>
          </a>

          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-surface-container border border-surface-container-high px-6 py-4 rounded-xl font-bold hover:bg-surface-container-high transition-colors text-on-surface"
          >
            <Mail size={20} className="text-primary" />
            <div>
              <div className="text-sm uppercase tracking-widest opacity-60 font-body font-normal">{t("modal.emailLabel")}</div>
              <div className="font-headline">{email}</div>
            </div>
          </a>
        </div>

        <p className="font-body text-xs text-secondary text-center mt-6 opacity-70">
          {t("modal.hours")}
        </p>
      </motion.div>
    </div>
  );
};

// --- Navigation ---

const Navbar = ({ onReserve }: { onReserve: () => void }) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.menu"), href: "#menu" },
    { label: t("nav.gallery"), href: "#gallery" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-surface/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <div className={`font-headline italic text-2xl transition-colors ${isScrolled ? "text-primary" : "text-white"}`}>Madre</div>

        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-headline uppercase tracking-wider text-sm transition-colors ${isScrolled ? "text-secondary hover:text-primary" : "text-white/90 hover:text-white"}`}
            >
              {item.label}
            </a>
          ))}
          <LanguageSwitcher light={!isScrolled} />
          <button type="button" onClick={onReserve} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-sm tracking-wide hover:opacity-90 transition-opacity active:scale-95">
            {t("nav.reserve")}
          </button>
        </div>

        <button type="button" className={`md:hidden transition-colors ${isScrolled ? "text-primary" : "text-white"}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-surface border-b border-surface-container-high p-8 flex flex-col gap-6"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-headline uppercase tracking-wider text-lg text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <LanguageSwitcher />
          <button type="button" onClick={() => { setMobileMenuOpen(false); onReserve(); }} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-lg">
            {t("nav.reserve")}
          </button>
        </motion.div>
      )}
    </nav>
  );
};

// --- Sections ---

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="Madre bistro"
          className="w-full h-full object-cover"
          src="/images/hero.jpg"
        />
        <div className="absolute inset-0 bg-black/35"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="inline-block font-body text-white bg-primary px-4 py-1 rounded-full text-xs uppercase tracking-widest mb-6">
            {t("hero.badge")}
          </span>
          <h1 className="font-headline text-6xl md:text-8xl text-white mb-6 leading-tight tracking-tight">
            {t("hero.headline")}
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-body max-w-lg mb-10 leading-relaxed">
            {t("hero.body")}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#menu" className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold transition-all hover:shadow-xl hover:-translate-y-1">
              {t("hero.viewMenu")}
            </a>
            <a href="#about" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all">
              {t("hero.ourStory")}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  const { t } = useTranslation();
  return (
    <section id="about" className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-[4/5] bg-surface-container rounded-lg overflow-hidden relative z-10"
          >
            <img
              alt="Madre bistro"
              className="w-full h-full object-cover"
              src="/images/about-main.jpg"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-12 -right-12 w-2/3 aspect-square bg-surface-container-high rounded-lg overflow-hidden border-8 border-surface z-20 hidden md:block"
          >
            <img
              alt="Priprema jela"
              className="w-full h-full object-cover"
              src="/images/about-inset.jpg"
            />
          </motion.div>
        </div>
        <div className="space-y-8">
          <h2 className="font-headline text-5xl text-primary leading-tight">{t("about.headline")}</h2>
          <div className="h-1 w-24 bg-tertiary/20"></div>
          <p className="text-on-surface-variant text-lg leading-relaxed font-body">
            {t("about.body1")}
          </p>
          <p className="text-on-surface-variant text-lg leading-relaxed font-body">
            {t("about.body2")}
          </p>
          <p className="text-on-surface-variant text-lg leading-relaxed font-body italic border-l-4 border-primary/20 pl-6 py-2">
            {t("about.quote")}
          </p>
          <div className="pt-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-headline text-2xl text-tertiary">{t("about.stat1Value")}</h4>
                <p className="text-sm font-body uppercase tracking-tighter text-secondary">{t("about.stat1Label")}</p>
              </div>
              <div>
                <h4 className="font-headline text-2xl text-tertiary">{t("about.stat2Value")}</h4>
                <p className="text-sm font-body uppercase tracking-tighter text-secondary">{t("about.stat2Label")}</p>
              </div>
              <div>
                <h4 className="font-headline text-2xl text-tertiary">{t("about.stat3Value")}</h4>
                <p className="text-sm font-body uppercase tracking-tighter text-secondary">{t("about.stat3Label")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Menu = () => {
  const { t } = useTranslation();
  return (
    <section id="menu" className="py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="font-headline text-5xl mb-4">{t("menu.headline")}</h2>
          <p className="font-body text-secondary max-w-xl mx-auto">{t("menu.subheadline")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Feature */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7 bg-white rounded-xl overflow-hidden shadow-sm group"
          >
            <div className="h-[400px] overflow-hidden">
              <img
                alt={t("menu.dish1Name")}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="/images/jelo-1.jpg"
              />
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline text-3xl text-primary">{t("menu.dish1Name")}</h3>
                <span className="font-headline text-xl text-tertiary">€24</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">{t("menu.dish1Desc")}</p>
            </div>
          </motion.div>

          {/* Side Dishes Stack */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-sm flex group h-full"
            >
              <div className="w-1/3 overflow-hidden">
                <img
                  alt={t("menu.dish2Name")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="/images/jelo-2.jpg"
                />
              </div>
              <div className="w-2/3 p-6 flex flex-col justify-center">
                <h4 className="font-headline text-xl mb-2">{t("menu.dish2Name")}</h4>
                <p className="text-sm text-on-surface-variant">{t("menu.dish2Desc")}</p>
                <span className="mt-4 font-headline text-tertiary">€22</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-row-reverse group h-full"
            >
              <div className="w-1/3 overflow-hidden">
                <img
                  alt={t("menu.dish3Name")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="/images/jelo-3.jpg"
                />
              </div>
              <div className="w-2/3 p-6 flex flex-col justify-center text-right">
                <h4 className="font-headline text-xl mb-2">{t("menu.dish3Name")}</h4>
                <p className="text-sm text-on-surface-variant">{t("menu.dish3Desc")}</p>
                <span className="mt-4 font-headline text-tertiary">€13</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Wide Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-12 bg-secondary text-white rounded-xl p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm"
          >
            <div className="flex-1">
              <h3 className="font-headline text-3xl mb-4">{t("menu.specialName")}</h3>
              <p className="opacity-90">{t("menu.specialDesc")}</p>
            </div>
            <a href="#contact" className="bg-white text-primary px-10 py-4 rounded-lg font-bold hover:bg-surface-container transition-colors whitespace-nowrap">
              {t("menu.specialCta")}
            </a>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <a
            href="https://stupendous-axolotl-8be28a.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold transition-all hover:shadow-xl hover:-translate-y-1"
          >
            {t("menu.fullMenu")} <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

const Gallery = () => {
  const { t } = useTranslation();

  const galleryImages = [
    // Vani — eksterijer i natpisi
    { src: "/images/galerija-7.jpg", alt: t("gallery.alt7") },   // ulaz / storefront
    { src: "/images/galerija-18.jpg", alt: t("gallery.alt18") }, // ručno rađena vrata
    { src: "/images/galerija-14.jpg", alt: t("gallery.alt14") }, // "OPEN" ploča
    { src: "/images/galerija-1.jpg", alt: t("gallery.alt1") },   // Madre natpis
    // Unutra — prostor
    { src: "/images/galerija-8.jpg", alt: t("gallery.alt8") },   // stolovi uz prozor
    { src: "/images/galerija-12.jpg", alt: t("gallery.alt12") }, // kutak / kameni stup
    { src: "/images/galerija-16.jpg", alt: t("gallery.alt16") }, // lampioni / banketa
    { src: "/images/galerija-5.jpg", alt: t("gallery.alt5") },   // drveni ormar
    // Uz čašu
    { src: "/images/galerija-10.jpg", alt: t("gallery.alt10") }, // nazdravljanje
    // Spiza
    { src: "/images/galerija-2.jpg", alt: t("gallery.alt2") },   // ravioli
    { src: "/images/galerija-11.jpg", alt: t("gallery.alt11") }, // njoki s junetinom
    { src: "/images/galerija-9.jpg", alt: t("gallery.alt9") },   // tagliatelle ragu
    { src: "/images/galerija-13.jpg", alt: t("gallery.alt13") }, // tagliatelle burrata
    { src: "/images/galerija-15.jpg", alt: t("gallery.alt15") }, // kremasta tjestenina
    { src: "/images/galerija-17.jpg", alt: t("gallery.alt17") }, // lazanje
    { src: "/images/galerija-3.jpg", alt: t("gallery.alt3") },   // arancini
    { src: "/images/galerija-4.jpg", alt: t("gallery.alt4") },   // carpaccio
    { src: "/images/galerija-6.jpg", alt: t("gallery.alt6") },   // tiramisu
  ];

  return (
    <section id="gallery" className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="font-headline text-5xl mb-4">{t("gallery.headline")}</h2>
          <p className="font-body text-secondary max-w-xl mx-auto">{t("gallery.subheadline")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 3) * 0.08 }}
              className="aspect-square overflow-hidden rounded-xl group"
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const { t } = useTranslation();
  return (
    <section id="contact" className="py-32 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
            <div>
              <h2 className="font-headline text-5xl mb-8">{t("contact.headline")}</h2>
              <p className="text-on-surface-variant text-lg mb-12">{t("contact.body")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <MapPin size={20} />
                  <h5 className="font-bold uppercase tracking-widest text-xs">{t("contact.addressLabel")}</h5>
                </div>
                <p className="text-on-surface-variant">
                  {t("contact.addressLine1")}<br />
                  {t("contact.addressLine2")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Phone size={20} />
                  <h5 className="font-bold uppercase tracking-widest text-xs">{t("contact.reservationsLabel")}</h5>
                </div>
                <div className="flex flex-col gap-1">
                  <a href="tel:+385953545315" className="text-on-surface-variant hover:text-primary transition-colors">+385 95 35 45 315</a>
                  <a href="mailto:madre.split@gmail.com" className="text-on-surface-variant hover:text-primary transition-colors">madre.split@gmail.com</a>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-3 text-primary">
                  <Clock size={20} />
                  <h5 className="font-bold uppercase tracking-widest text-xs">{t("contact.hoursLabel")}</h5>
                </div>
                <div className="flex flex-col gap-2 text-on-surface-variant max-w-xs">
                  <div className="flex justify-between gap-8">
                    <p>{t("contact.tueSun")}</p>
                    <p>14:00 — 23:00</p>
                  </div>
                  <div className="flex justify-between gap-8">
                    <p>{t("contact.mon")}</p>
                    <p>{t("contact.closed")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[500px] w-full bg-surface-container rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            <iframe
              title={t("contact.mapTitle")}
              className="w-full flex-1 border-0"
              src="https://maps.google.com/maps?q=Ul.+kralja+Zvonimira+12,+21000,+Split,+Croatia&output=embed"
              allowFullScreen
              loading="lazy"
            />
            <div className="bg-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-headline text-sm text-primary">Ul. kralja Zvonimira 12</p>
                <p className="text-xs text-on-surface-variant">{t("contact.addressLine2")}</p>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Ul.+kralja+Zvonimira+12,+21000,+Split,+Croatia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all whitespace-nowrap"
              >
                {t("contact.openMap")} <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-surface-container py-12 border-t border-surface-container-high">
      <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <div className="font-headline italic text-xl text-primary mb-4">Madre</div>
          <p className="font-body text-sm text-secondary max-w-xs leading-relaxed">
            {t("footer.tagline")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h6 className="font-body font-bold text-xs uppercase tracking-widest text-primary mb-2">{t("footer.connectLabel")}</h6>
          <a href="https://www.instagram.com/madre.split/" target="_blank" rel="noopener noreferrer" className="text-tertiary hover:underline decoration-primary underline-offset-4 opacity-80 hover:opacity-100 transition-opacity text-sm flex items-center gap-2 justify-center md:justify-start">
            <Instagram size={14} /> Instagram
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <h6 className="font-body font-bold text-xs uppercase tracking-widest text-primary mb-2">{t("footer.legalLabel")}</h6>
          <Link to="/politika-privatnosti" className="text-tertiary hover:underline decoration-primary underline-offset-4 opacity-80 hover:opacity-100 transition-opacity text-sm">{t("footer.privacy")}</Link>
          <Link to="/uvjeti-koristenja" className="text-tertiary hover:underline decoration-primary underline-offset-4 opacity-80 hover:opacity-100 transition-opacity text-sm">{t("footer.terms")}</Link>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="font-body text-xs text-secondary opacity-60">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};

export default function App() {
  const [reservationOpen, setReservationOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {reservationOpen && <ReservationModal onClose={() => setReservationOpen(false)} />}
      </AnimatePresence>
      <Navbar onReserve={() => setReservationOpen(true)} />
      <main>
        <Hero />
        <About />
        <Menu />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
