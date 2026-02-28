"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  url: string;
  caption: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <section id="galerie" className="section-padding bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4">Naše fotky</h2>
          <p className="text-[var(--color-text-light)] max-w-xl mx-auto">
            Momenty, které jsme spolu prožili
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {images.map((image, index) => (
            <button
              key={image.url}
              onClick={() => openLightbox(index)}
              className="aspect-square bg-[var(--color-secondary)] rounded-lg overflow-hidden group relative cursor-pointer"
            >
              {/* Placeholder - v produkci bude Image component */}
              <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-light)]">
                <span className="text-sm">Foto {index + 1}</span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            </button>
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
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Previous button */}
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

            {/* Image */}
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

            {/* Next button */}
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
