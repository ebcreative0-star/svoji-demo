'use client';

import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import { Button } from '@/components/ui';

interface DashboardNavProps {
  partner1: string;
  partner2: string;
  slug?: string;
}

const navItems = [
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
  { href: '/budget', label: 'Rozpočet', icon: Wallet },
  { href: '/guests', label: 'Hosté', icon: Users },
  { href: '/chat', label: 'AI Asistent', icon: MessageCircle },
  { href: '/settings', label: 'Nastavení', icon: Settings },
];

export function DashboardNav({ partner1, partner2, slug }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Desktop top nav bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/checklist" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Svooji" width={100} height={24} />
              <span className="text-sm text-[var(--color-text-light)]">
                {partner1} & {partner2}
              </span>
            </Link>

            {/* Nav items */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors border-b-2 ${
                      isActive
                        ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                        : 'text-[var(--color-text-light)] border-transparent hover:text-[var(--color-primary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {slug && (
                <Link
                  href={`/w/${slug}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Web pro hosty</span>
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Odhlásit se"
                leadingIcon={<LogOut className="w-4 h-4" />}
                className="text-[var(--color-text-light)] hover:text-red-600"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile top bar (minimal) */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/checklist" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Svooji" width={80} height={20} />
            {partner1 && partner2 && (
              <span className="text-xs text-[var(--color-text-light)]">
                {partner1} & {partner2}
              </span>
            )}
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            aria-label="Odhlásit se"
            leadingIcon={<LogOut className="w-4 h-4" />}
            className="text-[var(--color-text-light)] hover:text-red-600"
          />
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 ${
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-light)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
