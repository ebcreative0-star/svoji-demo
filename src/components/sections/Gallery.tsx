"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

interface GalleryImage {
  url: string;
  caption: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  const disableParallax = isMobile || prefersReducedMotion;

  return (
    <section ref={ref} id="galerie" className="section-padding bg-white relative overflow-hidden">
      {/* Parallax background layer */}
      <motion.div
        className="absolute inset-0 bg-white"
        style={{ y: disableParallax ? 0 : backgroundY }}
      />

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4 font-heading text-[var(--color-text)]">Naše fotky</h2>
          <p className="text-[var(--color-text-light)] max-w-xl mx-auto">
            Momenty, které jsme spolu prožili
          </p>
        </div>

        {/* Grid with staggered entrance */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {images.map((image, index) => (
            <ScrollReveal key={image.url} delay={index * 0.1}>
              <button
                onClick={() => openLightbox(index)}
                className="aspect-square bg-[var(--color-secondary)] rounded-lg overflow-hidden group relative cursor-pointer"
              >
                {/* Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-light)] group-hover:scale-105 transition-transform duration-500">
                  <span className="text-sm">Foto {index + 1}</span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm">{image.caption}</p>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>

        {/* Lightbox */}
        {selectedIndex !== null && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Předchozí"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <div
              className="max-w-4xl max-h-[80vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[var(--color-secondary)] w-full aspect-video flex items-center justify-center rounded-lg">
                <span className="text-[var(--color-text-light)]">
                  {images[selectedIndex].caption}
                </span>
              </div>
              <p className="text-white mt-4 text-center">
                {images[selectedIndex].caption}
              </p>
              <p className="text-white/60 text-sm mt-1">
                {selectedIndex + 1} / {images.length}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Další"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
