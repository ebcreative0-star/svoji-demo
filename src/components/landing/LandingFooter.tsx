import Image from 'next/image';

export function LandingFooter() {
  return (
    <footer className="py-20 border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          {/* Logo */}
          <Image src="/logo.svg" alt="Svooji" width={100} height={24} />

          {/* Copyright */}
          <p className="text-sm text-[var(--color-text-light)]">
            {new Date().getFullYear()} Svooji. Vytvořeno s láskou v Česku.
          </p>
        </div>
      </div>
    </footer>
  );
}
