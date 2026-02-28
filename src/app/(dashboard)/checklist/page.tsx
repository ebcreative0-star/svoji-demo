import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChecklistView } from '@/components/dashboard/ChecklistView';
import { generateChecklist, type WeddingSize } from '@/lib/checklist-generator';
import { DEMO_COUPLE, DEMO_CHECKLIST } from '@/lib/demo-data';

// Always demo mode for now
const isDemoMode = true;

export default async function ChecklistPage() {
  // Demo mode
  if (isDemoMode) {
    const demoItems = DEMO_CHECKLIST.map((item) => ({
      ...item,
      couple_id: DEMO_COUPLE.id,
      sort_order: 0,
      completed_at: null,
      created_at: new Date().toISOString(),
    }));

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2">Váš checklist</h1>
          <p className="text-sm sm:text-base text-[var(--color-text-light)]">
            {DEMO_COUPLE.partner1_name} & {DEMO_COUPLE.partner2_name} - svatba{' '}
            {new Date(DEMO_COUPLE.wedding_date).toLocaleDateString('cs-CZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs sm:text-sm text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-lg inline-block">
            Demo režim - změny se neukládají
          </p>
        </div>

        <ChecklistView
          items={demoItems}
          weddingDate={DEMO_COUPLE.wedding_date}
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

  // Nacist existujici checklist
  let { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('couple_id', user.id)
    .order('due_date', { ascending: true });

  // Pokud checklist neexistuje, vygenerovat
  if (!checklistItems || checklistItems.length === 0) {
    const generatedItems = generateChecklist({
      weddingDate: new Date(couple.wedding_date),
      weddingSize: couple.wedding_size as WeddingSize,
    });

    // Ulozit do databaze
    const itemsToInsert = generatedItems.map((item) => ({
      couple_id: user.id,
      title: item.title,
      description: item.description || null,
      category: item.category,
      due_date: item.dueDate.toISOString().split('T')[0],
      priority: item.priority,
      completed: false,
      sort_order: item.sortOrder,
    }));

    const { data: insertedItems } = await supabase
      .from('checklist_items')
      .insert(itemsToInsert)
      .select();

    checklistItems = insertedItems;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2">Váš checklist</h1>
        <p className="text-sm sm:text-base text-[var(--color-text-light)]">
          {couple.partner1_name} & {couple.partner2_name} - svatba{' '}
          {new Date(couple.wedding_date).toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <ChecklistView
        items={checklistItems || []}
        weddingDate={couple.wedding_date}
      />
    </div>
  );
}
