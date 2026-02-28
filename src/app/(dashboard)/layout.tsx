import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DEMO_COUPLE } from '@/lib/demo-data';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode - skip auth
  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <DashboardNav
          partner1={DEMO_COUPLE.partner1_name}
          partner2={DEMO_COUPLE.partner2_name}
        />
        <main className="pt-16">{children}</main>
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

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <DashboardNav
        partner1={couple.partner1_name}
        partner2={couple.partner2_name}
      />
      <main className="pt-16">{children}</main>
    </div>
  );
}
