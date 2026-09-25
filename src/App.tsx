/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import Reveal from "./Reveal";
import dailySpecials from "./dailySpecials.json";
import {
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Instagram,
  Menu as MenuIcon,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "./i18n";
import ReservationForm from "./ReservationForm";

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
        aria-pressed={current === "hr"}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${current === "hr" ? activeClass : inactiveClass}`}
      >
        <span className="text-base leading-none">🇭🇷</span> HR
      </button>
      <span className={`opacity-40 ${light ? "text-white" : "text-secondary"}`}>|</span>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        aria-pressed={current === "en"}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${current === "en" ? activeClass : inactiveClass}`}
      >
        <span className="text-base leading-none">🇬🇧</span> EN
      </button>
    </div>
  );
};

const ThemeToggle = ({ light = false }: { light?: boolean }) => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("madre-theme", next ? "dark" : "light");
    } catch {
      // Storage blocked — the theme still switches for this visit.
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Light mode" : "Dark mode"}
      className={`p-1.5 rounded-full transition-colors ${light ? "text-white/90 hover:text-white" : "text-secondary hover:text-primary"}`}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

// --- Reservation Modal ---

/** Marks links that open the modal over this page, so closing it can simply go back. */
const FROM_SITE = { fromSite: true };

const ReservationModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in motion-reduce:animate-none" />

      {/* Card */}
      <div
        className="relative bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl px-6 pt-8 pb-0 sm:p-8 w-full max-w-lg max-h-[92svh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden overscroll-contain animate-rise-in motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-2 text-secondary hover:text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <h2 id="reservation-title" className="font-headline text-2xl text-primary mb-2">{t("modal.headline")}</h2>
        <p className="font-body text-sm text-on-surface-variant mb-6">
          {t("modal.body")}
        </p>

        <ReservationForm />

        <p className="font-body text-xs text-secondary text-center mt-4 sm:mt-6 pb-6 sm:pb-0 opacity-70">
          {t("modal.hours")}
        </p>
      </div>
    </div>
  );
};

// --- Navigation ---

const Navbar = ({ onReserve }: { onReserve: () => void }) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.menu"), href: "#menu" },
    { label: t("nav.gallery"), href: "#gallery" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      // Only blur once the navbar has cleared the hero video, since
      // backdrop-blur over a <video> triggers a purple compositing artifact.
      setPastHero(window.scrollY > window.innerHeight - 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        !isScrolled
          ? "bg-transparent py-6"
          : pastHero
            ? "bg-surface/90 backdrop-blur-md shadow-sm py-4"
            : "bg-surface shadow-sm py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <a href="#" className={`font-headline italic text-2xl transition-colors ${isScrolled ? "text-primary" : "text-white"}`}>Madre</a>

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
          <ThemeToggle light={!isScrolled} />
          <button type="button" onClick={onReserve} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-sm tracking-wide hover:opacity-90 transition-opacity active:scale-95">
            {t("nav.reserve")}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          {!mobileMenuOpen && (
            <button type="button" onClick={onReserve} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm active:scale-95 transition-transform">
              {t("nav.reserve")}
            </button>
          )}
          <button type="button" aria-label="Menu" aria-expanded={mobileMenuOpen} className={`p-1 transition-colors ${isScrolled ? "text-primary" : "text-white"}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-surface-container-high p-8 flex flex-col gap-6 animate-drop-in motion-reduce:animate-none">
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
          <div className="flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <button type="button" onClick={() => { setMobileMenuOpen(false); onReserve(); }} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-lg">
            {t("nav.reserve")}
          </button>
        </div>
      )}
    </nav>
  );
};

// --- Sections ---

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-svh md:h-screen flex items-center overflow-hidden pt-28 pb-16 md:py-0">
      <div className="absolute inset-0 z-0">
        {/* The photo is always there; on wider screens the video plays on top of it once it loads.
            (Phones get only the photo: an empty <video> would show Safari's play button, and a
            hidden one would still download its poster.) */}
        <img
          src="/images/hero.webp"
          srcSet="/images/hero-sm.webp 800w, /images/hero.webp 1400w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <video
          className="absolute inset-0 hidden md:block w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/hero.mp4" type="video/mp4" media="(min-width: 768px)" />
        </video>
        <div className="absolute inset-0 bg-black/35"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
        <div
          // No entrance animation here: this text is the page's largest paint, and fading it
          // in from opacity 0 made Google measure it only after JavaScript loaded.
          className="max-w-2xl"
        >
          <span className="hidden md:inline-block font-body text-primary-foreground bg-primary px-4 py-1 rounded-full text-xs uppercase tracking-widest mb-6">
            {t("hero.badge")}
          </span>
          <h1 className="font-headline text-5xl sm:text-6xl md:text-8xl text-white mb-6 leading-tight tracking-tight">
            {t("hero.headline")}
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-body max-w-lg mb-10 leading-relaxed">
            {t("hero.body")}
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <Link to="/rezervacija" state={FROM_SITE} className="text-center bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold transition-all hover:shadow-xl hover:-translate-y-1">
              {t("nav.reserve")}
            </Link>
            <a href="#menu" className="text-center bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all">
              {t("hero.viewMenu")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  const { t, i18n } = useTranslation();
  // The locals discount is for Croatian speakers only — not shown on the English site.
  const showLocalsDiscount = i18n.language.startsWith("hr");
  return (
    <section id="about" className="py-20 md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
        <div className="relative">
          <Reveal from="scale" className="aspect-[4/5] bg-surface-container rounded-lg overflow-hidden relative z-10">
            <img
              alt="Madre bistro"
              className="w-full h-full object-cover"
              src="/images/about-main.webp"
              srcSet="/images/about-main-sm.webp 640w, /images/about-main.webp 750w"
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="lazy"
              decoding="async"
            />
          </Reveal>
          <Reveal
            from="right"
            delay={0.3}
            className="absolute -bottom-12 -right-12 w-2/3 aspect-square bg-surface-container-high rounded-lg overflow-hidden border-8 border-surface z-20 hidden md:block"
          >
            <img
              alt="Priprema jela"
              className="w-full h-full object-cover"
              src="/images/about-inset.webp"
              loading="lazy"
              decoding="async"
            />
          </Reveal>
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
            <div className={`grid gap-6 ${showLocalsDiscount ? "grid-cols-3" : "grid-cols-2"}`}>
              <div>
                <h3 className="font-headline text-2xl text-tertiary">{t("about.stat1Value")}</h3>
                <p className="text-sm font-body uppercase tracking-tighter text-secondary">{t("about.stat1Label")}</p>
              </div>
              <div>
                <h3 className="font-headline text-2xl text-tertiary">{t("about.stat2Value")}</h3>
                <p className="text-sm font-body uppercase tracking-tighter text-secondary">{t("about.stat2Label")}</p>
              </div>
              {showLocalsDiscount && (
                <div>
                  <h3 className="font-headline text-2xl text-tertiary">{t("about.stat3Value")}</h3>
                  <p className="text-sm font-body uppercase tracking-tighter text-secondary">{t("about.stat3Label")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// The dishes themselves live in src/dailySpecials.json so a price or a dish can be
// changed on GitHub without touching code.
const DailySpecials = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("hr") ? "hr" : "en";
  const updated = new Date(dailySpecials.updated).toLocaleDateString(lang === "hr" ? "hr-HR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <Reveal
      id="dnevna-jela"
      className="md:col-span-12 bg-card rounded-xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 group"
    >
      <div className="md:col-span-5 h-72 md:h-auto overflow-hidden">
        <img
          alt={t("menu.daily.njoki.name")}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          src="/images/njoki-pasticada.webp"
        />
      </div>
      <div className="md:col-span-7 p-8 md:p-10">
        <span className="inline-block font-body text-primary-foreground bg-primary px-4 py-1 rounded-full text-xs uppercase tracking-widest mb-4">
          {t("menu.dailyBadge")}
        </span>
        <h3 className="font-headline text-3xl text-primary mb-2">{t("menu.dailyHeadline")}</h3>
        <p className="flex items-center gap-2 text-sm text-secondary mb-8">
          <Clock size={16} /> {t("menu.dailyHours")}
        </p>
        <div className="space-y-6">
          {dailySpecials.groups.map((section) => (
            <div key={section.group}>
              <h4 className="font-body font-bold text-xs uppercase tracking-widest text-tertiary mb-3">
                {t(`menu.${section.group}`)}
              </h4>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.hr.name}>
                    <div className="flex justify-between items-baseline gap-4">
                      <p className="font-headline text-lg">{item[lang].name}</p>
                      <span className="font-headline text-tertiary whitespace-nowrap">€{item.price}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant italic">{item[lang].desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-secondary mt-8 opacity-80">
          {t("menu.dailyUpdated", { date: updated })} · {t("menu.dailyNote")}
        </p>
      </div>
    </Reveal>
  );
};

const Menu = () => {
  const { t } = useTranslation();
  return (
    <section id="menu" className="py-20 md:py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="font-headline text-5xl mb-4">{t("menu.headline")}</h2>
          <p className="font-body text-secondary max-w-xl mx-auto">{t("menu.subheadline")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Feature */}
          <Reveal className="md:col-span-7 bg-card rounded-xl overflow-hidden shadow-sm group">
            <div className="h-[400px] overflow-hidden">
              <img
                alt={t("menu.dish1Name")}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="/images/njoki-tartuf.webp"
                srcSet="/images/njoki-tartuf-sm.webp 640w, /images/njoki-tartuf.webp 750w"
                sizes="(min-width: 768px) 58vw, 100vw"
              loading="lazy"
              decoding="async"
              />
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline text-3xl text-primary">{t("menu.dish1Name")}</h3>
                <span className="font-headline text-xl text-tertiary">€20</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">{t("menu.dish1Desc")}</p>
            </div>
          </Reveal>

          {/* Side Dishes Stack */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Reveal from="right" className="bg-card rounded-xl overflow-hidden shadow-sm flex group h-full">
              <div className="w-1/3 overflow-hidden">
                <img
                  alt={t("menu.dish2Name")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="/images/linguine-buca-panceta.webp"
              loading="lazy"
              decoding="async"
                />
              </div>
              <div className="w-2/3 p-6 flex flex-col justify-center">
                <h4 className="font-headline text-xl mb-2">{t("menu.dish2Name")}</h4>
                <p className="text-sm text-on-surface-variant">{t("menu.dish2Desc")}</p>
                <span className="mt-4 font-headline text-tertiary">€21</span>
              </div>
            </Reveal>

            <Reveal from="right" delay={0.1} className="bg-card rounded-xl overflow-hidden shadow-sm flex flex-row-reverse group h-full">
              <div className="w-1/3 overflow-hidden">
                <img
                  alt={t("menu.dish3Name")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="/images/ravioli-ricotta-pistacio.webp"
              loading="lazy"
              decoding="async"
                />
              </div>
              <div className="w-2/3 p-6 flex flex-col justify-center text-right">
                <h4 className="font-headline text-xl mb-2">{t("menu.dish3Name")}</h4>
                <p className="text-sm text-on-surface-variant">{t("menu.dish3Desc")}</p>
                <span className="mt-4 font-headline text-tertiary">€19</span>
              </div>
            </Reveal>
          </div>

          {/* Daily Specials */}
          <DailySpecials />
        </div>

        <div className="text-center mt-12">
          <a
            href="https://madre-menu.netlify.app/"
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
    { src: "/images/galerija/ulaz.webp", alt: t("gallery.alt7") },   // ulaz / storefront
    { src: "/images/galerija/ulazna-vrata.webp", alt: t("gallery.alt18") }, // ručno rađena vrata
    { src: "/images/galerija/ploca-dobrodoslice.webp", alt: t("gallery.alt14") }, // "OPEN" ploča
    { src: "/images/galerija/madre-natpis.webp", alt: t("gallery.alt1") },   // Madre natpis
    // Unutra — prostor
    { src: "/images/galerija/stolovi-uz-prozor.webp", alt: t("gallery.alt8") },   // stolovi uz prozor
    { src: "/images/galerija/kutak.webp", alt: t("gallery.alt12") }, // kutak / kameni stup
    { src: "/images/galerija/lampioni.webp", alt: t("gallery.alt16") }, // lampioni / banketa
    { src: "/images/galerija/interijer.webp", alt: t("gallery.alt5") },   // drveni ormar
    // Uz čašu
    { src: "/images/galerija/nazdravljanje.webp", alt: t("gallery.alt10") }, // nazdravljanje
    // Spiza — predjela
    { src: "/images/galerija/juha-od-buce.webp", alt: t("gallery.alt19"), meal: true }, // juha od buče
    { src: "/images/galerija/spring-role.webp", alt: t("gallery.alt20"), meal: true }, // komiške spring role
    { src: "/images/galerija/tatarski-biftek.webp", alt: t("gallery.alt21"), meal: true }, // tatarski biftek
    { src: "/images/galerija/pasteta-pileca-brusnica.webp", alt: t("gallery.alt22"), meal: true }, // pileća pašteta
    { src: "/images/galerija/burrata-arancin.webp", alt: t("gallery.alt3"), meal: true },   // arancini
    { src: "/images/galerija/beef-carpaccio.webp", alt: t("gallery.alt4"), meal: true },   // carpaccio
    { src: "/images/galerija/parmigiana-melanzana.webp", alt: t("gallery.alt17"), meal: true }, // parmigiana
    // Spiza — njoki
    { src: "/images/galerija/njoki-pivac-gljive.webp", alt: t("gallery.alt23"), meal: true }, // njoki pivac i gljive
    { src: "/images/galerija/njoki-lignja-bob.webp", alt: t("gallery.alt24"), meal: true }, // njoki lignja i bob
    { src: "/images/galerija/njoki-pasticada.webp", alt: t("gallery.alt11"), meal: true }, // njoki s junetinom
    // Spiza — manistra
    { src: "/images/galerija/tagliatelle-junetina.webp", alt: t("gallery.alt25"), meal: true }, // tagliatelle junetina
    { src: "/images/galerija/linguine-adria.webp", alt: t("gallery.alt26"), meal: true }, // linguine adria
    { src: "/images/galerija/linguine.webp", alt: t("gallery.alt27"), meal: true }, // manistra i šalša
    { src: "/images/galerija/carbonara-raviol.webp", alt: t("gallery.alt2"), meal: true },   // ravioli
    { src: "/images/galerija/tagliatelle-ragu.webp", alt: t("gallery.alt9"), meal: true },   // tagliatelle ragu
    { src: "/images/galerija/tagliatelle-mortadella.webp", alt: t("gallery.alt13"), meal: true }, // tagliatelle burrata
    { src: "/images/galerija/ravioli-kozice.webp", alt: t("gallery.alt15"), meal: true }, // kremasta tjestenina
    // Spiza — slatko
    { src: "/images/galerija/creme-brulee-buca.webp", alt: t("gallery.alt28"), meal: true }, // crème brûlée od buče
    { src: "/images/galerija/kruska-kozji-sir-crumble.webp", alt: t("gallery.alt29"), meal: true }, // kruška i kozji sir
    { src: "/images/galerija/3-praline.webp", alt: t("gallery.alt30"), meal: true }, // 3 praline
    { src: "/images/galerija/tiramisu.webp", alt: t("gallery.alt6"), meal: true },   // tiramisu
  ];

  return (
    <section id="gallery" className="py-20 md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="font-headline text-5xl mb-4">{t("gallery.headline")}</h2>
          <p className="font-body text-secondary max-w-xl mx-auto">{t("gallery.subheadline")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <Reveal
              as="figure"
              key={image.src}
              from="scale"
              delay={(index % 3) * 0.08}
              className="relative aspect-square overflow-hidden rounded-xl group"
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Dishes get their name on hover: a soft shade along the bottom edge only, so the
                  food stays the focus. Hidden from screen readers — the alt text already says it. */}
              {image.meal && (
                <figcaption
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-3 md:p-4 h-1/2 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                >
                  <span className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-full border border-white/25 bg-white/15 backdrop-blur-md px-3 py-1.5 md:px-4 font-headline text-sm md:text-base leading-tight text-white shadow-lg">
                    {image.alt}
                  </span>
                </figcaption>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const { t } = useTranslation();
  return (
    <section id="contact" className="py-20 md:py-32 bg-surface overflow-hidden">
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
                  <h3 className="font-bold uppercase tracking-widest text-xs">{t("contact.addressLabel")}</h3>
                </div>
                <p className="text-on-surface-variant">
                  {t("contact.addressLine1")}<br />
                  {t("contact.addressLine2")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Phone size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">{t("contact.reservationsLabel")}</h3>
                </div>
                <div className="flex flex-col gap-1">
                  <a href="tel:+385953545315" className="text-on-surface-variant hover:text-primary transition-colors">+385 95 35 45 315</a>
                  <a href="mailto:madre.split@gmail.com" className="text-on-surface-variant hover:text-primary transition-colors">madre.split@gmail.com</a>
                </div>
                <Link to="/rezervacija" state={FROM_SITE} className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
                  {t("contact.reserveOnline")} <ArrowRight size={16} />
                </Link>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-3 text-primary">
                  <Clock size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">{t("contact.hoursLabel")}</h3>
                </div>
                <div className="flex flex-col gap-2 text-on-surface-variant max-w-xs">
                  <div className="flex justify-between gap-8">
                    <p>{t("contact.tueSun")}</p>
                    <p>11:00 – 23:00</p>
                  </div>
                  <div className="flex justify-between gap-8 text-sm opacity-80">
                    <p>{t("contact.dailyMenu")}</p>
                    <p>11:00 – 18:00</p>
                  </div>
                  <div className="flex justify-between gap-8">
                    <p>{t("contact.mon")}</p>
                    <p>{t("contact.closed")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-80 md:h-[500px] w-full bg-surface-container rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            <iframe
              title={t("contact.mapTitle")}
              className="w-full flex-1 border-0"
              src="https://maps.google.com/maps?q=Ul.+kralja+Zvonimira+12,+21000,+Split,+Croatia&output=embed"
              allowFullScreen
              loading="lazy"
            />
            <div className="bg-card px-6 py-4 flex items-center justify-between">
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
          <h3 className="font-body font-bold text-xs uppercase tracking-widest text-primary mb-2">{t("footer.connectLabel")}</h3>
          <a href="https://www.instagram.com/madre.split/" target="_blank" rel="noopener noreferrer" className="text-tertiary hover:underline decoration-primary underline-offset-4 text-sm flex items-center gap-2 justify-center md:justify-start">
            <Instagram size={14} /> Instagram
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-body font-bold text-xs uppercase tracking-widest text-primary mb-2">{t("footer.legalLabel")}</h3>
          <Link to="/politika-privatnosti" className="text-tertiary hover:underline decoration-primary underline-offset-4 text-sm">{t("footer.privacy")}</Link>
          <Link to="/uvjeti-koristenja" className="text-tertiary hover:underline decoration-primary underline-offset-4 text-sm">{t("footer.terms")}</Link>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="font-body text-xs text-secondary">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // The modal lives at /rezervacija so it can be linked to directly (Google Business Profile etc.).
  // Netlify redirects it to /rezervacija/ because the prerendered page is a folder, so allow the slash.
  const reservationOpen = location.pathname.replace(/\/+$/, "") === "/rezervacija";

  const openReservation = () => navigate("/rezervacija", { state: FROM_SITE });
  const closeReservation = () => {
    // Opened from a button on this page → go back; opened any other way (Google profile,
    // "book again" on the cancel page) → land on home, since going back there makes no sense.
    if ((location.state as typeof FROM_SITE | null)?.fromSite) navigate(-1);
    else navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen">
      {reservationOpen && <ReservationModal onClose={closeReservation} />}
      <Navbar onReserve={openReservation} />
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
