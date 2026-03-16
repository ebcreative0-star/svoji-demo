'use client';

import { useState } from 'react';
import { DashboardNav } from './DashboardNav';
import { SearchModal, type SearchItem } from './SearchModal';

interface DashboardClientShellProps {
  children: React.ReactNode;
  searchItems: SearchItem[];
  partner1: string;
  partner2: string;
  slug?: string;
}

export function DashboardClientShell({
  children,
  searchItems,
  partner1,
  partner2,
  slug,
}: DashboardClientShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <DashboardNav
        partner1={partner1}
        partner2={partner2}
        slug={slug}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <SearchModal items={searchItems} open={searchOpen} onOpenChange={setSearchOpen} />
      <main className="pt-16 pb-20 md:pb-0">{children}</main>
    </>
  );
}
