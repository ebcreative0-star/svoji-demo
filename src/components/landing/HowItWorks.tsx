'use client';

import Link from 'next/link';
import { UserPlus, CalendarHeart, Sparkles, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StaggerContainer } from '@/components/animation/StaggerContainer';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Vytvořte účet',
    description: 'Registrace zabere 30 sekund. Stačí email a jste připraveni.',
    color: 'var(--color-accent-rose)',
  },
  {
    icon: CalendarHeart,
    step: '02',
    title: 'Zadejte detail svatby',
    description: 'Datum, rozpočet, počet hostů. AI se přizpůsobí vašim potřebám.',
    color: 'var(--color-accent-sage)',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'AI vytvoří plán',
    description: 'Personalizovaný checklist, rozpočet a časový plán na míru.',
    color: 'var(--color-primary)',
  },
];

export function HowItWorks() {
  return (
    <section className="min-h-[100dvh] flex items-center bg-white py-24 lg:py-32 snap-start">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <ScrollReveal className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-4">
            Začněte za{' '}
            <span className="text-[var(--color-primary)]">2 minuty</span>
          </h2>
          <p className="text-[var(--color-text-light)] text-lg max-w-2xl mx-auto">
            Žádné složité nastavení. Tři jednoduché kroky a máte osobního svatebního plánovače.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.step} className="h-full">
                <div className="relative bg-[var(--color-secondary)] rounded-2xl p-8 lg:p-10 h-full flex flex-col items-center text-center">
                  {/* Step number */}
                  <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-text-light)] mb-4">
                    Krok {item.step}
                  </span>

                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-serif text-xl text-[var(--color-text)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--color-text-light)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </StaggerContainer>

        {/* CTA */}
        <ScrollReveal className="text-center">
          <Link
            href="/register"
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            Zkusit zdarma
            <ArrowRight className="w-5 h-5" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
