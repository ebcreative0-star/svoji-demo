'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  CheckSquare,
  Wallet,
  Users,
  MessageCircle,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardNavProps {
  partner1: string;
  partner2: string;
}

const navItems = [
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
  { href: '/budget', label: 'Rozpočet', icon: Wallet },
  { href: '/guests', label: 'Hosté', icon: Users },
  { href: '/chat', label: 'AI Asistent', icon: MessageCircle },
  { href: '/settings', label: 'Nastavení', icon: Settings },
];

export function DashboardNav({ partner1, partner2 }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/checklist" className="flex items-center gap-2">
            <span className="text-xl font-serif text-[var(--color-primary)]">Svoji</span>
            <span className="text-sm text-[var(--color-text-light)] hidden sm:inline">
              {partner1} & {partner2}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--color-secondary)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-light)] hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/w/preview"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Web pro hosty</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-light)] hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                    isActive
                      ? 'bg-[var(--color-secondary)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-light)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <hr className="my-2" />

            <Link
              href="/w/preview"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 text-[var(--color-text-light)]"
            >
              <Globe className="w-5 h-5" />
              <span>Web pro hosty</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 text-red-600 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Odhlásit se</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
