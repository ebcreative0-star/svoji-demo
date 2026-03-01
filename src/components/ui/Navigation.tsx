"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  partner1?: string;
  partner2?: string;
}

const navItems = [
  { href: "#o-nas", label: "O nás" },
  { href: "#program", label: "Program" },
  { href: "#mista", label: "Místa" },
  { href: "#galerie", label: "Galerie" },
  { href: "#info", label: "Info" },
  { href: "#rsvp", label: "RSVP" },
];

export function Navigation({ partner1, partner2 }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayName = `${partner1 || "Partner 1"} & ${partner2 || "Partner 2"}`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with couple names */}
          <a href="#" className="text-xl font-heading text-[var(--color-text)]">
            {displayName}
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm uppercase tracking-wider text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            aria-label={isOpen ? "Zavřít menu" : "Otevřít menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)]">
          <div className="container py-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block py-3 text-sm uppercase tracking-wider text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
