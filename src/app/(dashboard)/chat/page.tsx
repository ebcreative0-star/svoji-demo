import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { DEMO_COUPLE, DEMO_CHAT } from '@/lib/demo-data';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default async function ChatPage() {
  // Demo mode
  if (isDemoMode) {
    const demoMessages = DEMO_CHAT.map((msg) => ({
      ...msg,
      couple_id: DEMO_COUPLE.id,
      created_at: new Date().toISOString(),
    }));

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
        <div className="mb-4">
          <p className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg inline-block">
            Demo rezim - AI chat neni aktivni, vidite pouze ukazkovou konverzaci
          </p>
        </div>
        <ChatInterface
          couple={{
            id: DEMO_COUPLE.id,
            partner1: DEMO_COUPLE.partner1_name,
            partner2: DEMO_COUPLE.partner2_name,
            weddingDate: DEMO_COUPLE.wedding_date,
            weddingSize: DEMO_COUPLE.wedding_size,
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

  // Nacist historii chatu (poslednich 50 zprav)
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: true })
    .limit(50);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
      <ChatInterface
        couple={{
          id: couple.id,
          partner1: couple.partner1_name,
          partner2: couple.partner2_name,
          weddingDate: couple.wedding_date,
          weddingSize: couple.wedding_size,
          budget: couple.budget_total,
        }}
        initialMessages={messages || []}
      />
    </div>
  );
}
