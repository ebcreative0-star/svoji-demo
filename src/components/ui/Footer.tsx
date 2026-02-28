"use client";

import { Heart } from "lucide-react";

interface FooterProps {
  partner1: string;
  partner2: string;
}

export function Footer({ partner1, partner2 }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-[var(--color-text)] text-white">
      <div className="container">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-lg font-light">{partner1}</span>
            <Heart className="w-4 h-4 text-[var(--color-accent)] fill-current" />
            <span className="text-lg font-light">{partner2}</span>
          </div>
          <p className="text-sm text-white/60">
            © {currentYear} • Vytvořeno s láskou
          </p>
        </div>
      </div>
    </footer>
  );
}
