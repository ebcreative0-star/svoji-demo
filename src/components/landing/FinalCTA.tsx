'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animation/ScrollReveal';

export function FinalCTA() {
  return (
    <section className="min-h-[80dvh] flex items-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] py-24 lg:py-32">
      <ScrollReveal className="w-full">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center text-white">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-6">
            Váš velký den si zaslouží klid
          </h2>
          <p className="text-lg lg:text-xl opacity-90 mb-10 max-w-xl mx-auto">
            Přidejte se ke stovkám párů, které plánují svatbu bez stresu.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-white text-[var(--color-primary)] text-base font-medium px-8 py-4 rounded-full hover:bg-gray-100 transition-colors gap-2 min-h-[52px]"
          >
            Začít zdarma
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm opacity-70 mt-6">
            Bez platební karty · Zrušte kdykoliv
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
