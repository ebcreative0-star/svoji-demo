import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GuestsView } from '@/components/dashboard/GuestsView';
import { DEMO_COUPLE, DEMO_GUESTS } from '@/lib/demo-data';

// Always demo mode for now
const isDemoMode = true;

export default async function GuestsPage() {
  // Demo mode
  if (isDemoMode) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2">Seznam hostů</h1>
          <p className="text-sm sm:text-base text-[var(--color-text-light)]">
            Spravujte pozvané hosty a sledujte RSVP
          </p>
          <p className="text-xs sm:text-sm text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-lg inline-block">
            Demo režim - změny se neukládají
          </p>
        </div>

        <GuestsView guests={DEMO_GUESTS} coupleId={DEMO_COUPLE.id} />
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

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2">Seznam hostů</h1>
        <p className="text-sm sm:text-base text-[var(--color-text-light)]">
          Spravujte pozvané hosty a sledujte RSVP
        </p>
      </div>

      <GuestsView guests={guests || []} coupleId={couple.id} />
    </div>
  );
}
