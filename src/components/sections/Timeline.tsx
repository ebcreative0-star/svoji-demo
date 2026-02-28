"use client";

import { Church, Camera, Wine, UtensilsCrossed, Music, PartyPopper } from "lucide-react";

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  icon: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  church: Church,
  camera: Camera,
  wine: Wine,
  utensils: UtensilsCrossed,
  music: Music,
  party: PartyPopper,
};

export function Timeline({ items }: TimelineProps) {
  return (
    <section id="program" className="section-padding bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Program dne</h2>
          <p className="text-[var(--color-text-light)] max-w-xl mx-auto">
            Těšíme se na společně strávený den plný radosti a oslav
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-[var(--color-secondary)] -translate-x-1/2" />

            {items.map((item, index) => {
              const Icon = iconMap[item.icon] || PartyPopper;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.time}
                  className={`relative flex items-center mb-12 last:mb-0 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 pl-20 md:pl-0 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                    <div className="bg-[var(--color-secondary)] p-6 rounded-lg inline-block">
                      <span className="text-sm text-[var(--color-primary)] font-medium tracking-wider">
                        {item.time}
                      </span>
                      <h3 className="text-xl mt-1 mb-2">{item.title}</h3>
                      <p className="text-[var(--color-text-light)] text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-2 border-[var(--color-primary)] rounded-full flex items-center justify-center z-10">
                    <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>

                  {/* Empty space for alignment on desktop */}
                  <div className="hidden md:block flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
