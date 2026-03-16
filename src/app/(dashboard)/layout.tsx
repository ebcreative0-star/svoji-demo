import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardClientShell } from '@/components/dashboard/DashboardClientShell';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { isDemoMode, DEMO_COUPLE } from '@/lib/demo-data';
import type { SearchItem } from '@/components/dashboard/SearchModal';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode - skip auth, no search data
  if (isDemoMode()) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <DashboardClientShell
          searchItems={[]}
          partner1={DEMO_COUPLE.partner1_name}
          partner2={DEMO_COUPLE.partner2_name}
          slug="demo"
        >
          {children}
        </DashboardClientShell>
      </div>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Zkontrolovat onboarding
  const { data: couple } = await supabase
    .from('couples')
    .select('onboarding_completed, partner1_name, partner2_name')
    .eq('id', user.id)
    .single();

  if (!couple?.onboarding_completed) {
    redirect('/onboarding');
  }

  const { data: website } = await supabase
    .from('wedding_websites')
    .select('slug')
    .eq('couple_id', user.id)
    .single();

  // Fetch all domains for search
  const [{ data: checklistItems }, { data: budgetItems }, { data: guestItems }] =
    await Promise.all([
      supabase
        .from('checklist_items')
        .select('id, title, category, tags')
        .eq('couple_id', user.id),
      supabase
        .from('budget_items')
        .select('id, name, category, estimated_cost, tags')
        .eq('couple_id', user.id),
      supabase
        .from('guests')
        .select('id, name, group_name, tags')
        .eq('couple_id', user.id),
    ]);

  // Transform into SearchItem[]
  const searchItems: SearchItem[] = [
    ...(checklistItems ?? []).map(
      (item): SearchItem => ({
        id: item.id,
        title: item.title,
        domain: 'checklist',
        subtitle: item.category ?? undefined,
        tags: item.tags ?? [],
        href: `/checklist?highlight=${item.id}`,
      })
    ),
    ...(budgetItems ?? []).map(
      (item): SearchItem => ({
        id: item.id,
        title: item.name,
        domain: 'budget',
        subtitle: [
          item.estimated_cost != null
            ? `${item.estimated_cost.toLocaleString('cs-CZ')} Kc`
            : null,
          item.category,
        ]
          .filter(Boolean)
          .join(' - ') || undefined,
        tags: item.tags ?? [],
        href: `/budget?highlight=${item.id}`,
      })
    ),
    ...(guestItems ?? []).map(
      (item): SearchItem => ({
        id: item.id,
        title: item.name,
        domain: 'guests',
        subtitle: item.group_name ?? undefined,
        tags: item.tags ?? [],
        href: `/guests?highlight=${item.id}`,
      })
    ),
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <DashboardClientShell
        searchItems={searchItems}
        partner1={couple.partner1_name}
        partner2={couple.partner2_name}
        slug={website?.slug}
      >
        {children}
      </DashboardClientShell>
    </div>
  );
}
