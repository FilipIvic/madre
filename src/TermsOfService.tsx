import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-8 py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-12 hover:gap-4 transition-all"
        >
          <ArrowLeft size={16} /> Povratak na početnu
        </Link>

        <h1 className="font-headline text-5xl text-primary mb-4">Uvjeti korištenja</h1>
        <p className="font-body text-sm text-secondary mb-12">Zadnja izmjena: {new Date().toLocaleDateString("hr-HR")}</p>

        <div className="space-y-10 font-body text-on-surface-variant leading-relaxed">

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">1. Prihvaćanje uvjeta</h2>
            <p>
              Korištenjem ove web stranice prihvaćate ove uvjete korištenja u cijelosti. Ako se ne slažete s bilo kojim
              dijelom ovih uvjeta, molimo vas da ne koristite stranicu.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">2. Korištenje stranice</h2>
            <p>Ova stranica služi isključivo za informiranje gostiju o restoranu Madre Bistro i olakšavanje rezervacija. Zabranjeno je:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Korištenje stranice u nezakonite svrhe</li>
              <li>Pokušaj neovlaštenog pristupa sustavima stranice</li>
              <li>Reproduciranje sadržaja bez pisanog odobrenja</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">3. Rezervacije</h2>
            <p>
              Rezervacija putem telefona ili emaila smatra se potvrđenom tek kada dobijete potvrdu od naše strane.
              Molimo vas da nas obavijestite najmanje [UNESI PERIOD] unaprijed u slučaju otkazivanja.
            </p>
            <p>
              Zadržavamo pravo odbiti rezervaciju bez navođenja razloga.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">4. Točnost informacija</h2>
            <p>
              Trudimo se održavati informacije na stranici (jelovnik, radno vrijeme, cijene) ažurnima, no ne jamčimo
              njihovu potpunu točnost u svakom trenutku. Za najnovije informacije preporučujemo direktan kontakt.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">5. Intelektualno vlasništvo</h2>
            <p>
              Sav sadržaj na ovoj stranici — uključujući tekstove, fotografije, logotip i dizajn — vlasništvo je
              Madre Bistro i zaštićen je autorskim pravom. Reprodukcija bez pisanog odobrenja nije dopuštena.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">6. Odricanje od odgovornosti</h2>
            <p>
              Madre Bistro ne odgovara za eventualnu štetu nastalu korištenjem ove web stranice ili nemogućnošću
              pristupa istoj. Stranica se pruža „kakva jest" bez ikakvih izričitih ili implicitnih jamstava.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">7. Promjene uvjeta</h2>
            <p>
              Zadržavamo pravo izmjene ovih uvjeta u bilo kojem trenutku. Nastavak korištenja stranice nakon
              objave izmjena smatra se prihvaćanjem novih uvjeta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">8. Primjenjivo pravo</h2>
            <p>
              Ovi uvjeti tumače se i primjenjuju u skladu s pravom Republike Hrvatske. Za sve sporove
              nadležan je sud u Splitu.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">9. Kontakt</h2>
            <p>Za pitanja vezana uz ove uvjete:</p>
            <ul className="list-none space-y-1">
              <li>Email: <a href="mailto:madre.split@gmail.com" className="text-primary hover:underline">madre.split@gmail.com</a></li>
              <li>Telefon: <a href="tel:+385953545315" className="text-primary hover:underline">+385 95 35 45 315</a></li>
              <li>Adresa: Ul. kralja Zvonimira 12, 21000 Split, Hrvatska</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
