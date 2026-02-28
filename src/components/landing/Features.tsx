'use client';

import { MessageCircle, ClipboardList, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StaggerContainer } from '@/components/animation/StaggerContainer';

const features = [
  {
    icon: MessageCircle,
    title: 'AI Asistent',
    description: 'Ptejte se na cokoli ohledně svatby. AI zná české tradice, dodavatele i aktuální ceny.',
    color: 'var(--color-accent-rose)',
  },
  {
    icon: ClipboardList,
    title: 'Interaktivní management plánování',
    description: 'Checklist, rozpočet a seznam hostů na jednom místě. Vše přizpůsobené vašemu datu a stylu.',
    color: 'var(--color-accent-sage)',
  },
  {
    icon: Globe,
    title: 'Web pro hosty',
    description: 'Krásný svatební web s RSVP, programem a mapou. Sdílejte ho jedním odkazem.',
    color: 'var(--color-primary)',
  },
];

export function Features() {
  return (
    <section className="min-h-[100dvh] flex items-center bg-white py-24 lg:py-32 snap-start">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <ScrollReveal className="text-center mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-4">
            Vše co potřebujete
          </h2>
          <p className="text-[var(--color-text-light)] text-lg max-w-2xl mx-auto">
            Jeden nástroj pro celou přípravu. Od prvního nápadu až po velký den.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={feature.title} className="h-full">
                <Card
                  className="p-8 lg:p-10 h-full"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-serif text-xl text-[var(--color-text)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--color-text-light)] leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </ScrollReveal>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
