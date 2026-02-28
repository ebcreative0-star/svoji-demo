import { Heart } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="py-16 border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-serif text-lg text-[var(--color-primary)]">Svoji</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-[var(--color-text-light)]">
            {new Date().getFullYear()} Svoji. Vytvořeno s láskou v Česku.
          </p>
        </div>
      </div>
    </footer>
  );
}
