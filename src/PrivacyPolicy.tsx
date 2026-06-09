import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-8 py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-12 hover:gap-4 transition-all"
        >
          <ArrowLeft size={16} /> Povratak na početnu
        </Link>

        <h1 className="font-headline text-5xl text-primary mb-4">Politika privatnosti</h1>
        <p className="font-body text-sm text-secondary mb-12">Zadnja izmjena: {new Date().toLocaleDateString("hr-HR")}</p>

        <div className="space-y-10 font-body text-on-surface-variant leading-relaxed">

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">1. Tko smo</h2>
            <p>
              Madre Bistro (dalje: „mi", „naš") je restoran smješten na Ul. kralja Zvonimira 12, 21000 Split, Hrvatska.
              Ova politika privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše osobne podatke kada koristite
              našu web stranicu ili stupate u kontakt s nama.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">2. Koje podatke prikupljamo</h2>
            <p>Možemo prikupljati sljedeće osobne podatke:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ime i prezime (pri rezervaciji stola)</li>
              <li>Broj telefona (pri rezervaciji ili direktnom kontaktu)</li>
              <li>Email adresu (pri slanju upita ili rezervaciji)</li>
              <li>Broj gostiju i datum rezervacije</li>
              <li>Napomene koje sami dostavite (npr. alergije, posebni zahtjevi)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">3. Kako koristimo vaše podatke</h2>
            <p>Vaše podatke koristimo isključivo u svrhu:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upravljanja rezervacijama i potvrdama</li>
              <li>Odgovaranja na vaše upite</li>
              <li>Poboljšanja naše usluge</li>
            </ul>
            <p>Vaše podatke ne prodajemo, ne iznajmljujemo niti dijelimo s trećim stranama bez vašeg izričitog pristanka.</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">4. Čuvanje podataka</h2>
            <p>
              Vaše osobne podatke čuvamo samo onoliko dugo koliko je potrebno za ispunjenje svrhe zbog koje su prikupljeni,
              ili koliko zahtijeva zakon. Rezervacijski podaci se brišu nakon [UNESI PERIOD].
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">5. Vaša prava</h2>
            <p>U skladu s GDPR-om, imate pravo na:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pristup vašim osobnim podacima</li>
              <li>Ispravak netočnih podataka</li>
              <li>Brisanje vaših podataka („pravo na zaborav")</li>
              <li>Prigovor na obradu podataka</li>
              <li>Prenosivost podataka</li>
            </ul>
            <p>Za ostvarivanje ovih prava kontaktirajte nas na <a href="mailto:madre.split@gmail.com" className="text-primary hover:underline">madre.split@gmail.com</a>.</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">6. Kolačići (cookies)</h2>
            <p>
              Ova web stranica trenutno ne koristi kolačiće za praćenje. Ako se to promijeni, ova politika bit će ažurirana.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-on-surface">7. Kontakt</h2>
            <p>
              Za sva pitanja vezana uz privatnost podataka možete nas kontaktirati:
            </p>
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
