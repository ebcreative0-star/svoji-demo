'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[var(--color-border)]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 min-h-[44px]">
            <Heart className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="text-xl font-serif text-[var(--color-primary)]">Svoji</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] min-h-[44px] inline-flex items-center px-3 transition-colors"
            >
              Přihlásit se
            </Link>
            <Link href="/register" className={buttonVariants({ variant: 'primary', size: 'md' })}>
              Začít zdarma
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-[var(--color-text)]"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Zavřít menu' : 'Otevřít menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="sm:hidden bg-white/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 pb-4 flex flex-col gap-2"
          >
            <Link
              href="/login"
              className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] min-h-[44px] flex items-center px-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Přihlásit se
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ variant: 'primary', size: 'md' })}
              onClick={() => setIsMenuOpen(false)}
            >
              Začít zdarma
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
