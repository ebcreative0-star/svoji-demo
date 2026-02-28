'use client';

import { ScrollReveal } from '@/components/animation/ScrollReveal';

const stats = [
  { value: '500+', label: 'párů plánuje' },
  { value: '40h', label: 'ušetřeného času' },
  { value: '4.9★', label: 'hodnocení' },
];

export function SocialProof() {
  return (
    <section className="min-h-[60dvh] flex items-center bg-[var(--color-secondary)] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-8 md:gap-16">
                <div className="text-center">
                  <p className="font-serif text-4xl lg:text-5xl text-[var(--color-primary)]">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[var(--color-text-light)] mt-1">
                    {stat.label}
                  </p>
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden md:block w-px h-12 bg-[var(--color-border)]" />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
