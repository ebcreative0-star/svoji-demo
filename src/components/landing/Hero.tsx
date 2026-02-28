'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckSquare } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/animation/ScrollReveal';

const chatMessages = [
  {
    id: 1,
    from: 'user' as const,
    text: 'Kolik stojí svatební fotograf v Praze?',
    delay: 0.3,
  },
  {
    id: 2,
    from: 'ai' as const,
    text: 'Ceny se pohybují mezi 15-40 tisíci Kč. Pro Prahu doporučuji počítat s 25-30 tisíci.',
    delay: 1.0,
  },
  {
    id: 3,
    from: 'user' as const,
    text: 'A co videograf?',
    delay: 2.0,
  },
  {
    id: 4,
    from: 'ai' as const,
    text: 'Videograf vyjde na 20-50 tisíc Kč. Tip: některé studia nabízejí balíček foto + video se slevou.',
    delay: 2.8,
  },
];

const messageVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[var(--color-secondary)] pt-20">
      {/* Grain texture overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Content */}
      <ScrollReveal className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-sm font-medium text-[var(--color-primary)]">
            AI-powered svatební plánování
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 leading-[1.1] tracking-tight">
          Naplánujte svatbu
          <br />
          <span className="text-[var(--color-primary)]">bez stresu</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg lg:text-xl text-[var(--color-text-light)] mb-10 max-w-lg mx-auto leading-relaxed">
          Váš osobní AI asistent, který zná české tradice, ceny a pomůže vám s každým detailem.
        </p>

        {/* Dual CTA */}
        <div className="flex flex-row items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Vyzkoušet zdarma
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            Přihlásit se
          </Link>
        </div>

        {/* Social proof nudge */}
        <p className="mt-4 text-sm text-[var(--color-text-light)]">
          Přidalo se 500+ párů · Zdarma · Bez karty
        </p>

        {/* Chat mockup */}
        <div className="relative max-w-md mx-auto mt-12">
          {/* Mockup card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
            {/* Browser bar */}
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center text-xs text-gray-400">svoji.cz/chat</div>
            </div>

            {/* Chat messages */}
            <div className="p-6 space-y-4">
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={messageVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.4, ease: 'easeOut', delay: msg.delay }}
                  className={`flex gap-3 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-xs text-sm ${
                      msg.from === 'user'
                        ? 'bg-[var(--color-secondary)] rounded-tr-sm'
                        : 'bg-gray-50 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.from === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">Vy</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating stats card (desktop only) */}
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
      </ScrollReveal>
    </section>
  );
}
