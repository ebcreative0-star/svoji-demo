"use client";

import { MapPin, Clock, Car, Church, PartyPopper } from "lucide-react";

interface Location {
  type: string;
  name: string;
  address: string;
  time?: string;
  description: string;
  mapUrl: string;
}

interface LocationsProps {
  locations: Location[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ceremony: Church,
  reception: PartyPopper,
  parking: Car,
};

export function Locations({ locations }: LocationsProps) {
  return (
    <section id="mista" className="section-padding bg-[var(--color-secondary)]">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Kde nás najdete</h2>
          <p className="text-[var(--color-text-light)] max-w-xl mx-auto">
            Všechny důležité lokace pro váš pohodlný příjezd
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {locations.map((location) => {
            const Icon = iconMap[location.type] || MapPin;

            return (
              <div
                key={location.name}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{location.name}</h3>
                    {location.time && (
                      <div className="flex items-center gap-1 text-sm text-[var(--color-text-light)]">
                        <Clock className="w-3 h-3" />
                        <span>{location.time}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 mb-3 text-sm text-[var(--color-text-light)]">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{location.address}</span>
                </div>

                <p className="text-sm text-[var(--color-text-light)] mb-4">
                  {location.description}
                </p>

                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
                >
                  <span>Otevřít v mapách</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>

        {/* Embedded map placeholder */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center text-[var(--color-text-light)]">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Interaktivní mapa bude zde</p>
                <p className="text-sm">(Mapy.cz nebo Google Maps embed)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
