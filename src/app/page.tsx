import Link from 'next/link';
import {
  MessageCircle,
  CheckSquare,
  Wallet,
  ArrowRight,
  Heart,
  Sparkles,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'AI Asistent',
    description: 'Ptejte se na cokoli. AI zná české tradice a ceny.',
    color: '#D4A5A5',
  },
  {
    icon: CheckSquare,
    title: 'Chytrý checklist',
    description: 'Automaticky generovaný plán podle vašeho data.',
    color: '#A8B5A0',
  },
  {
    icon: Wallet,
    title: 'Rozpočet a hosté',
    description: 'Sledujte výdaje, spravujte RSVP. Vše na jednom místě.',
    color: '#C4A77D',
  },
];

const benefits = [
  'Ušetříte 40+ hodin plánování',
  'AI rozumí českým tradicím a cenám',
  'Checklist přizpůsobený vašemu datu',
  'Rozpočet a hosté pod kontrolou',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
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

      {/* Hero - Split layout */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-[var(--color-secondary)] px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-primary)]">AI-powered svatební plánování</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 leading-[1.1] tracking-tight">
                Naplánujte svatbu
                <br />
                <span className="text-[var(--color-primary)]">bez stresu</span>
              </h1>

              <p className="text-lg lg:text-xl text-[var(--color-text-light)] mb-8 max-w-lg leading-relaxed">
                Váš osobní AI asistent, který zná české tradice, ceny a pomůže vám s každým detailem.
              </p>

              {/* Benefits list */}
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-[var(--color-accent-sage)] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-[var(--color-text)]">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 font-medium rounded-full text-base px-8 py-4 min-h-[52px] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                >
                  Vyzkoušet zdarma
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 font-medium rounded-full text-base px-8 py-4 min-h-[52px] border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                >
                  Přihlásit se
                </Link>
              </div>

              <p className="mt-4 text-sm text-[var(--color-text-light)]">
                Bez platební karty · Zdarma do svatby
              </p>
            </div>

            {/* Right - App mockup */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative">
                {/* Decorative blobs */}
                <div className="absolute -top-8 -right-8 w-64 h-64 bg-[var(--color-accent-rose)] rounded-full opacity-20 blur-3xl" />
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[var(--color-accent-sage)] rounded-full opacity-20 blur-3xl" />

                {/* Main mockup card */}
                <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                  {/* Browser bar */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 text-center text-xs text-gray-400">svoji.cz/chat</div>
                  </div>

                  {/* Chat preview */}
                  <div className="p-6 space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">Vy</span>
                      </div>
                      <div className="bg-[var(--color-secondary)] rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                        <p className="text-sm">Kolik stojí svatební fotograf v Praze?</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                        <p className="text-sm mb-2">Ceny fotografů v Praze se pohybují:</p>
                        <ul className="text-sm space-y-1 text-[var(--color-text-light)]">
                          <li>• Základní balíček: 15-25 tisíc Kč</li>
                          <li>• Celodenní focení: 25-40 tisíc Kč</li>
                          <li>• Premium: 40-60 tisíc Kč</li>
                        </ul>
                        <p className="text-sm mt-2">Doporučuji počítat s 25-30 tisíc 📸</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stats card */}
                <div className="absolute -right-4 bottom-16 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--color-accent-sage)] rounded-xl flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">8/10 úkolů</p>
                      <p className="text-xs text-[var(--color-text-light)]">Tento měsíc</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Asymmetric cards */}
      <section id="features" className="py-20 lg:py-32 bg-[var(--color-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-4">
              Vše co potřebujete
            </h2>
            <p className="text-lg text-[var(--color-text-light)] max-w-lg mx-auto">
              Kompletní nástroje pro plánování svatby bez stresu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow ${
                    index === 1 ? 'md:-translate-y-4' : ''
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-[var(--color-text-light)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social proof banner */}
      <section className="py-12 bg-[var(--color-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-white">
            <div className="text-center">
              <p className="text-3xl lg:text-4xl font-serif">500+</p>
              <p className="text-sm opacity-80">párů plánuje</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl lg:text-4xl font-serif">40h</p>
              <p className="text-sm opacity-80">ušetřeného času</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl lg:text-4xl font-serif">4.9★</p>
              <p className="text-sm opacity-80">hodnocení</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Visual */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-[var(--color-secondary)] rounded-3xl p-8 lg:p-12">
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Zaregistrujte se', desc: 'Email a základní info', done: true },
                    { step: 2, title: 'Nastavte svatbu', desc: 'Datum, rozpočet, velikost', done: true },
                    { step: 3, title: 'AI vytvoří plán', desc: 'Personalizovaný checklist', done: false },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                        item.done ? 'bg-white shadow-sm' : 'bg-white/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        item.done
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {item.done ? <Check className="w-5 h-5" /> : item.step}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-[var(--color-text-light)]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Text */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-6 leading-tight">
                Začněte za
                <br />
                <span className="text-[var(--color-primary)]">2 minuty</span>
              </h2>
              <p className="text-lg text-[var(--color-text-light)] mb-8 leading-relaxed">
                Žádné složité nastavování. Zadejte základní informace a AI vám
                okamžitě vytvoří personalizovaný plán svatby.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 font-medium rounded-full text-base px-8 py-4 min-h-[52px] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              >
                Zkusit zdarma
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Full width */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-6">
            Váš velký den si zaslouží klid
          </h2>
          <p className="text-lg lg:text-xl opacity-90 mb-10 max-w-xl mx-auto">
            Přidejte se ke stovkám párů, které plánují svatbu bez stresu.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-white text-[var(--color-primary)] text-base font-medium px-8 py-4 rounded-full hover:bg-gray-100 transition-colors gap-2"
          >
            Vyzkoušet zdarma
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm opacity-70">
            Bez platební karty · Zrušte kdykoliv
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
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
