import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { isDemoMode, DEMO_COUPLE, DEMO_CHAT } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  // Demo mode
  if (isDemoMode()) {
    const demoMessages = DEMO_CHAT.map((msg) => ({
      ...msg,
      couple_id: DEMO_COUPLE.id,
      created_at: new Date().toISOString(),
    }));

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 h-[calc(100vh-4rem)]">
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg inline-block">
            Demo režim - AI chat není aktivní, vidíte pouze ukázkovou konverzaci
          </p>
        </div>
        <ChatInterface
          couple={{
            id: DEMO_COUPLE.id,
            partner1: DEMO_COUPLE.partner1_name,
            partner2: DEMO_COUPLE.partner2_name,
            weddingDate: DEMO_COUPLE.wedding_date,
            weddingSize: DEMO_COUPLE.wedding_size,
            guestCountRange: null,
            location: null,
            searchRadiusKm: null,
            weddingStyle: null,
            budget: DEMO_COUPLE.budget_total,
          }}
          initialMessages={demoMessages}
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

  // Nacist data paru
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!couple) {
    redirect('/onboarding');
  }

  // Nacist historii chatu (poslednich 50 zprav) a pocty dat
  const [messagesRes, checklistRes, budgetRes, guestsRes] = await Promise.all([
    supabase
      .from('chat_messages')
      .select('*')
      .eq('couple_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50),
    supabase
      .from('checklist_items')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', couple.id),
    supabase
      .from('budget_items')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', couple.id),
    supabase
      .from('guests')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', couple.id),
  ]);

  const dataState = {
    checklist: checklistRes.count ?? 0,
    budget: budgetRes.count ?? 0,
    guests: guestsRes.count ?? 0,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 h-[calc(100vh-4rem)]">
      <ChatInterface
        couple={{
          id: couple.id,
          partner1: couple.partner1_name,
          partner2: couple.partner2_name,
          weddingDate: couple.wedding_date,
          weddingSize: couple.wedding_size,
          guestCountRange: couple.guest_count_range,
          location: couple.location,
          searchRadiusKm: couple.search_radius_km,
          weddingStyle: couple.wedding_style,
          budget: couple.budget_total,
        }}
        initialMessages={messagesRes.data || []}
        dataState={dataState}
      />
    </div>
  );
}
