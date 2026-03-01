import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';

export function SaasFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-secondary)] text-[var(--color-text)] border-t-2 border-[var(--color-border)]">
      <div className="container mx-auto px-6 sm:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-heading text-[var(--color-text)]">
              Svoji
            </Link>
            <p className="mt-3 text-sm text-[var(--color-text-light)] leading-relaxed">
              Plánování svatby s AI asistentem
            </p>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-light)] mb-4">
              Právní informace
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/tos"
                  className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
                >
                  Obchodní podmínky
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
                >
                  Ochrana soukromí
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-light)] mb-4">
              Sledujte nás
            </h3>
            <a
              href="https://instagram.com/svoji.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
            >
              <Instagram className="w-5 h-5" />
              <span>Instagram</span>
            </a>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-light)] mb-4">
              Kontakt
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
                >
                  Kontaktujte nás
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@svoji.cz"
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@svoji.cz</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--color-border)] mt-10 pt-8 text-center text-sm text-[var(--color-text-light)]">
          &copy; {year} Svoji.cz. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}
