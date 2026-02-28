'use client';

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StaggerContainer } from '@/components/animation/StaggerContainer';

const steps = [
  { step: 1, title: 'Zaregistrujte se', desc: 'Email a základní info', done: true },
  { step: 2, title: 'Nastavte svatbu', desc: 'Datum, rozpočet, velikost', done: true },
  { step: 3, title: 'AI vytvoří plán', desc: 'Personalizovaný checklist', done: false },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: visual steps */}
            <div className="order-2 lg:order-1">
              <div className="bg-[var(--color-secondary)] rounded-3xl p-8 lg:p-12">
                <StaggerContainer className="space-y-4">
                  {steps.map((item) => (
                    <ScrollReveal key={item.step}>
                      <div
                        className={[
                          'flex items-center gap-4 rounded-xl p-4',
                          item.done ? 'bg-white shadow-sm' : 'bg-white/50',
                        ].join(' ')}
                      >
                        <div
                          className={[
                            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                            item.done
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-gray-100 text-gray-400',
                          ].join(' ')}
                        >
                          {item.done ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{item.step}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-text)]">{item.title}</p>
                          <p className="text-sm text-[var(--color-text-light)]">{item.desc}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </StaggerContainer>
              </div>
            </div>

            {/* Right: text + CTA */}
            <div className="order-1 lg:order-2">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-6">
                Začněte za{' '}
                <span className="text-[var(--color-primary)]">2 minuty</span>
              </h2>
              <p className="text-[var(--color-text-light)] text-lg leading-relaxed mb-8">
                Žádné složité nastavení. Registrace, datum svatby a AI sestaví
                váš osobní plán -- krok za krokem.
              </p>
              <Link
                href="/register"
                className={buttonVariants({ variant: 'primary', size: 'lg' })}
              >
                Zkusit zdarma
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
