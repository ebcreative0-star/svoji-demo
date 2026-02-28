import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BudgetView } from '@/components/dashboard/BudgetView';
import { DEMO_COUPLE, DEMO_BUDGET } from '@/lib/demo-data';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default async function BudgetPage() {
  // Demo mode
  if (isDemoMode) {
    const demoItems = DEMO_BUDGET.map((item) => ({
      ...item,
      couple_id: DEMO_COUPLE.id,
      vendor_id: null,
      notes: null,
      created_at: new Date().toISOString(),
    }));

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif mb-2">Rozpocet</h1>
          <p className="text-[var(--color-text-light)]">
            Sledujte vydaje na svatbu
          </p>
          <p className="text-sm text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-lg inline-block">
            Demo rezim - zmeny se neukladaji
          </p>
        </div>

        <BudgetView
          items={demoItems}
          totalBudget={DEMO_COUPLE.budget_total}
          coupleId={DEMO_COUPLE.id}
        />
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

  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!couple) {
    redirect('/onboarding');
  }

  const { data: budgetItems } = await supabase
    .from('budget_items')
    .select('*')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Rozpocet</h1>
        <p className="text-[var(--color-text-light)]">
          Sledujte vydaje na svatbu
        </p>
      </div>

      <BudgetView
        items={budgetItems || []}
        totalBudget={couple.budget_total}
        coupleId={couple.id}
      />
    </div>
  );
}
