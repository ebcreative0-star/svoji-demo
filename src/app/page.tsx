import Link from 'next/link';
import {
  MessageCircle,
  CheckSquare,
  Wallet,
  Users,
  Globe,
  Sparkles,
  ArrowRight,
  Heart,
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'AI Asistent 24/7',
    description:
      'Zeptejte se na cokoli - od výběru místa po rozpočet. Váš osobní svatební poradce.',
  },
  {
    icon: CheckSquare,
    title: 'Adaptivní checklist',
    description:
      'Automaticky generovaný seznam úkolů podle vašeho data svatby. Nic nezapomenete.',
  },
  {
    icon: Wallet,
    title: 'Rozpočet pod kontrolou',
    description:
      'Sledujte výdaje, porovnávejte s plánem. Žádná nepříjemná překvapení.',
  },
  {
    icon: Users,
    title: 'Seznam hostů',
    description:
      'RSVP, dietní omezení, zasedací pořádek. Vše na jednom místě.',
  },
  {
    icon: Globe,
    title: 'Svatební web',
    description:
      'Krásný web pro vaše hosty s programem, mapou a RSVP formulářem.',
  },
  {
    icon: Sparkles,
    title: 'České zvyklosti',
    description:
      'AI zná české tradice, ceny dodavatelů a lokální specifika.',
  },
];

const testimonials = [
  {
    quote:
      'Díky Svoji jsme ušetřili desítky hodin plánování. AI nám pomohlo najít perfektního fotografa v našem rozpočtu.',
    author: 'Petra & Martin',
    location: 'Praha',
  },
  {
    quote:
      'Checklist byl geniální - přizpůsobil se tomu, že jsme svatbu plánovali jen 4 měsíce dopředu.',
    author: 'Lucie & Tomáš',
    location: 'Brno',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-[var(--color-primary)]" />
              <span className="text-xl font-serif text-[var(--color-primary)]">
                Svoji
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
              >
                Prihlasit se
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm px-4 py-2"
              >
                Zacit zdarma
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif mb-6 leading-tight">
            Naplánujte svatbu
            <br />
            <span className="text-[var(--color-primary)]">s AI asistentem</span>
          </h1>
          <p className="text-xl text-[var(--color-text-light)] mb-8 max-w-2xl mx-auto">
            Svoji vás provede celým plánováním - od prvního rozhodnutí až po
            velký den. Checklist, rozpočet, hosté a AI poradce v jedné aplikaci.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              Zacit planovani
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-gray-200 rounded-full text-lg hover:bg-gray-50 transition-colors"
            >
              Jak to funguje
            </Link>
          </div>
          <p className="mt-6 text-sm text-[var(--color-text-light)]">
            Zdarma pro prvnich 100 paru
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[var(--color-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Vše co potrebujete</h2>
            <p className="text-[var(--color-text-light)] max-w-xl mx-auto">
              Kompletní sada nástrojů pro plánování svatby. Od AI asistenta po
              web pro hosty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white p-6 rounded-2xl shadow-sm"
                >
                  <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[var(--color-text-light)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Jak to funguje</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Zadejte zaklady</h3>
              <p className="text-[var(--color-text-light)]">
                Jména, datum svatby, přibližný rozpočet a velikost. Trvá to 2
                minuty.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI vytvoři plán
              </h3>
              <p className="text-[var(--color-text-light)]">
                Automaticky vám vygenerujeme checklist přizpůsobený vašemu datu
                a rozpočtu.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Plánujte s pomocí</h3>
              <p className="text-[var(--color-text-light)]">
                Ptejte se AI na cokoli, sledujte úkoly a rozpočet, spravujte
                hosty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[var(--color-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Co rikaji pary</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm">
                <p className="text-lg mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-[var(--color-text-light)]">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif mb-6">
            Připraveni začít plánovat?
          </h2>
          <p className="text-xl text-[var(--color-text-light)] mb-8">
            Registrace trvá 2 minuty. AI asistent je připravený pomoci.
          </p>
          <Link
            href="/register"
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
          >
            Zacit zdarma
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="font-serif text-[var(--color-primary)]">
                Svoji
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-light)]">
              2025 Svoji. Vytvoreno s laskou v Cesku.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
