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
    <div className="min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 min-h-[44px]">
              <Heart className="w-6 h-6 text-[var(--color-primary)]" />
              <span className="text-xl font-serif text-[var(--color-primary)]">
                Svoji
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] min-h-[44px] items-center px-3"
              >
                Přihlásit se
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-2.5 rounded-full min-h-[44px] hover:bg-[var(--color-primary-light)] transition-colors"
              >
                Začít zdarma
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-4 sm:mb-6 leading-tight">
            Naplánujte svatbu
            <br />
            <span className="text-[var(--color-primary)]">s AI asistentem</span>
          </h1>
          <p className="text-base sm:text-xl text-[var(--color-text-light)] mb-6 sm:mb-8 max-w-2xl mx-auto">
            Svoji vás provede celým plánováním - od prvního rozhodnutí až po
            velký den. Checklist, rozpočet, hosté a AI poradce v jedné aplikaci.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              href="/register"
              className="btn-primary !text-base sm:!text-lg !px-6 sm:!px-8 !py-3 sm:!py-4 inline-flex items-center justify-center gap-2"
            >
              Začít plánování
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="btn-outline !text-base sm:!text-lg !px-6 sm:!px-8 !py-3 sm:!py-4"
            >
              Jak to funguje
            </Link>
          </div>
          <p className="mt-4 sm:mt-6 text-sm text-[var(--color-text-light)]">
            Zdarma pro prvních 100 párů
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 sm:py-20 bg-[var(--color-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-serif mb-3 sm:mb-4">Vše co potřebujete</h2>
            <p className="text-sm sm:text-base text-[var(--color-text-light)] max-w-xl mx-auto">
              Kompletní sada nástrojů pro plánování svatby. Od AI asistenta po
              web pro hosty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-secondary)] rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-[var(--color-text-light)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-serif mb-4">Jak to funguje</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Zadejte základy</h3>
              <p className="text-sm sm:text-base text-[var(--color-text-light)]">
                Jména, datum svatby, přibližný rozpočet a velikost. Trvá to 2
                minuty.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                AI vytvoří plán
              </h3>
              <p className="text-sm sm:text-base text-[var(--color-text-light)]">
                Automaticky vám vygenerujeme checklist přizpůsobený vašemu datu
                a rozpočtu.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Plánujte s pomocí</h3>
              <p className="text-sm sm:text-base text-[var(--color-text-light)]">
                Ptejte se AI na cokoli, sledujte úkoly a rozpočet, spravujte
                hosty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-20 bg-[var(--color-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-serif mb-4">Co říkají páry</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm">
                <p className="text-base sm:text-lg mb-4 sm:mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
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
      <section className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-serif mb-4 sm:mb-6">
            Připraveni začít plánovat?
          </h2>
          <p className="text-base sm:text-xl text-[var(--color-text-light)] mb-6 sm:mb-8">
            Registrace trvá 2 minuty. AI asistent je připravený pomoci.
          </p>
          <Link
            href="/register"
            className="btn-primary !text-base sm:!text-lg !px-6 sm:!px-8 !py-3 sm:!py-4 inline-flex items-center gap-2"
          >
            Začít zdarma
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="font-serif text-[var(--color-primary)]">
                Svoji
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-light)]">
              {new Date().getFullYear()} Svoji. Vytvořeno s láskou v Česku.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
