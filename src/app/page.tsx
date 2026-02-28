import Link from 'next/link';
import {
  MessageCircle,
  CheckSquare,
  Wallet,
  ArrowRight,
  Heart,
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'AI Asistent',
    description:
      'Ptejte se na cokoli. AI zná české tradice, ceny dodavatelů a pomůže s každým rozhodnutím.',
  },
  {
    icon: CheckSquare,
    title: 'Chytrý checklist',
    description:
      'Automaticky generovaný plán podle vašeho data. Úkoly, deadliny, nic nezapomenete.',
  },
  {
    icon: Wallet,
    title: 'Rozpočet a hosté',
    description:
      'Sledujte výdaje, spravujte RSVP, dietní omezení. Vše přehledně na jednom místě.',
  },
];

const testimonials = [
  {
    quote:
      'Ušetřili jsme desítky hodin googlování. AI vědělo přesně co potřebujeme a v jakém rozpočtu.',
    author: 'Petra & Martin',
    location: 'Praha, svatba 2025',
  },
  {
    quote:
      'Plánovali jsme svatbu za 4 měsíce. Checklist se tomu přizpůsobil a nic jsme nezapomněli.',
    author: 'Lucie & Tomáš',
    location: 'Brno, svatba 2025',
  },
  {
    quote:
      'Konečně něco v češtině, co rozumí místním cenám a tradicím. Doporučuji každému páru.',
    author: 'Anna & Jakub',
    location: 'Olomouc, svatba 2025',
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
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm sm:text-base text-[var(--color-primary)] font-medium tracking-wide uppercase mb-4">
            Svatební plánování s AI
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif mb-6 sm:mb-8 leading-tight tracking-tight">
            Ušetřete 40+ hodin
            <br />
            <span className="text-[var(--color-primary)]">plánování svatby</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text-light)] mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            AI asistent, který zná české tradice a ceny. Checklist, rozpočet,
            hosté - vše na jednom místě.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              href="/register"
              className="btn-primary !text-base !px-8 !py-4 inline-flex items-center justify-center gap-2"
            >
              Vyzkoušet zdarma
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-[var(--color-text-light)]">
            Bez platební karty · Zdarma do svatby
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-[var(--color-secondary)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-serif mb-4">Vše na jednom místě</h2>
            <p className="text-base sm:text-lg text-[var(--color-text-light)] max-w-lg mx-auto">
              Kompletní nástroje pro plánování svatby bez stresu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="text-center"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-[var(--color-border)]">
                    <Icon className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-base text-[var(--color-text-light)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works - simplified */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif mb-4">Začněte za 2 minuty</h2>
            <p className="text-base sm:text-lg text-[var(--color-text-light)]">
              Zadejte datum a rozpočet. AI vám vytvoří personalizovaný plán.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-lg font-semibold">1</span>
              <span className="text-base">Registrace</span>
            </div>
            <div className="hidden md:block w-12 h-px bg-[var(--color-border)]"></div>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-lg font-semibold">2</span>
              <span className="text-base">AI plán</span>
            </div>
            <div className="hidden md:block w-12 h-px bg-[var(--color-border)]"></div>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-lg font-semibold">3</span>
              <span className="text-base">Plánujte</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-[var(--color-secondary)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif mb-4">Páry, které už plánují</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-border)]">
                <p className="text-base mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
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
      <section className="py-24 sm:py-32">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif mb-6">
            Váš velký den si zaslouží klid
          </h2>
          <p className="text-lg text-[var(--color-text-light)] mb-10">
            Nechte AI převzít starosti s plánováním.
          </p>
          <Link
            href="/register"
            className="btn-primary !text-base !px-8 !py-4 inline-flex items-center gap-2"
          >
            Vyzkoušet zdarma
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
