'use client';

import { Star, Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StaggerContainer } from '@/components/animation/StaggerContainer';

const stats = [
  { value: '500+', label: 'párů plánuje s námi' },
  { value: '40h', label: 'průměrně ušetřeného času' },
  { value: '4.9', label: 'hodnocení z 5.0' },
];

const testimonials = [
  {
    quote: 'Svoji nám ušetřil desítky hodin. AI asistent odpověděl na všechno, co jsme potřebovali vědět.',
    name: 'Tereza & Jakub',
    detail: 'Svatba v Praze, červen 2025',
  },
  {
    quote: 'Nejlepší investice do příprav. Checklist a rozpočet na jednom místě, žádný chaos v tabulkách.',
    name: 'Kateřina & Martin',
    detail: 'Svatba na Moravě, září 2025',
  },
  {
    quote: 'Hosté byli nadšení ze svatebního webu. RSVP fungovalo bezchybně a mapka všem pomohla.',
    name: 'Anna & Petr',
    detail: 'Svatba v jižních Čechách, srpen 2025',
  },
];

export function SocialProof() {
  return (
    <section className="min-h-[100dvh] flex items-center bg-[var(--color-secondary)] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        {/* Stats */}
        <ScrollReveal className="mb-20">
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-10 md:gap-20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <p className="font-serif text-5xl lg:text-6xl text-[var(--color-primary)]">
                      {stat.value}
                    </p>
                    {stat.label.includes('hodnocení') && (
                      <Star className="w-7 h-7 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-light)] mt-2">
                    {stat.label}
                  </p>
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden md:block w-px h-16 bg-[var(--color-border)]" />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Testimonials */}
        <ScrollReveal className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)]">
            Co říkají naši páry
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <ScrollReveal key={t.name} className="h-full">
              <div className="bg-white rounded-2xl p-8 lg:p-10 h-full flex flex-col shadow-sm border border-[var(--color-border)]">
                <Quote className="w-8 h-8 text-[var(--color-primary)] opacity-30 mb-4" />
                <p className="text-[var(--color-text)] leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm text-[var(--color-text)]">{t.name}</p>
                  <p className="text-xs text-[var(--color-text-light)] mt-1">{t.detail}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
