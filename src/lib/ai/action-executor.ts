/**
 * Action Executor
 * Executes database mutations based on classified intents
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { parseCzechDate } from '@/lib/date-utils';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Execute action based on intent classification
 */
export async function executeAction(
  supabase: SupabaseClient,
  coupleId: string,
  intent: string,
  params: Record<string, any>
): Promise<ActionResult> {
  try {
    switch (intent) {
      // Checklist actions
      case 'checklist_add':
        return await addChecklistItem(supabase, coupleId, params as { title: string; category?: string; due_date?: string; tags?: string[] });
      case 'checklist_add_multi':
        return await addChecklistItems(supabase, coupleId, params as { titles: string[]; category?: string; due_date?: string; tags?: string[] });
      case 'checklist_complete':
        return await completeChecklistItem(supabase, coupleId, params as { title: string });
      case 'checklist_remove':
        return await removeChecklistItem(supabase, coupleId, params as { title: string });
      case 'checklist_update':
        return await updateChecklistItem(supabase, coupleId, params as { title: string; updates: Record<string, any> });

      // Budget actions
      case 'budget_add':
        return await addBudgetItem(supabase, coupleId, params as { name: string; amount: number; category?: string; tags?: string[] });
      case 'budget_add_multi':
        return await addBudgetItems(supabase, coupleId, params as { items: { name: string; amount: number; category?: string }[] });
      case 'budget_update':
        return await updateBudgetItem(supabase, coupleId, params as { name: string; amount: number });
      case 'budget_remove':
        return await removeBudgetItem(supabase, coupleId, params as { name: string });
      case 'budget_mark_paid':
        return await markBudgetPaid(supabase, coupleId, params as { name: string; amount: number });

      // Guest actions
      case 'guest_add':
        return await addGuest(supabase, coupleId, params as { name: string; group?: string });
      case 'guest_add_multi':
        return await addGuests(supabase, coupleId, params as { names: string[]; group?: string });
      case 'guest_update':
        return await updateGuest(supabase, coupleId, params as { name: string; rsvp_status?: string; updates?: Record<string, any> });
      case 'guest_remove':
        return await removeGuest(supabase, coupleId, params as { name: string });

      // Query intents (read-only, return formatted context for system prompt)
      case 'checklist_query':
        return await queryChecklist(supabase, coupleId, params as { filter?: string });
      case 'budget_query':
        return await queryBudget(supabase, coupleId, params as { filter?: string });
      case 'guest_query':
        return await queryGuests(supabase, coupleId, params as { filter?: string });
      case 'status_overview':
        return await statusOverview(supabase, coupleId);

      default:
        return {
          success: false,
          message: 'Neznámý typ akce',
          error: `Unknown intent: ${intent}`,
        };
    }
  } catch (error) {
    console.error(`Action execution failed for ${intent}:`, error);
    return {
      success: false,
      message: 'Akce selhala kvůli technické chybě',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Checklist actions

async function addChecklistItem(
  supabase: SupabaseClient,
  coupleId: string,
  params: { title: string; category?: string; due_date?: string; tags?: string[] }
): Promise<ActionResult> {
  const { title, category, tags } = params;

  if (!title) {
    return { success: false, message: 'Chybí název položky', error: 'Missing title' };
  }

  // Get max sort_order for this couple
  const { data: maxOrderData } = await supabase
    .from('checklist_items')
    .select('sort_order')
    .eq('couple_id', coupleId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = maxOrderData?.[0]?.sort_order ? maxOrderData[0].sort_order + 1 : 1;

  const { data, error } = await supabase
    .from('checklist_items')
    .insert({
      couple_id: coupleId,
      title,
      category: category || 'other',
      description: null,
      due_date: params.due_date ? parseCzechDate(params.due_date) : null,
      priority: 'medium',
      completed: false,
      sort_order: nextSortOrder,
      tags: tags ?? null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Nepodařilo se přidat položku', error: error.message };
  }

  return {
    success: true,
    message: `Přidal jsem "${title}" do checklistu`,
    data,
  };
}

async function addChecklistItems(
  supabase: SupabaseClient,
  coupleId: string,
  params: { titles: string[]; category?: string; due_date?: string; tags?: string[] }
): Promise<ActionResult> {
  const { titles, category, tags } = params;

  if (!titles || !Array.isArray(titles) || titles.length === 0) {
    return { success: false, message: 'Chybi nazvy polozek', error: 'Missing titles array' };
  }

  // Get max sort_order for this couple
  const { data: maxOrderData } = await supabase
    .from('checklist_items')
    .select('sort_order')
    .eq('couple_id', coupleId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const baseOrder = maxOrderData?.[0]?.sort_order ?? 0;

  const rows = titles.map((title, i) => ({
    couple_id: coupleId,
    title: title.trim(),
    category: category || 'other',
    description: null,
    due_date: params.due_date ? parseCzechDate(params.due_date) : null,
    priority: 'medium',
    completed: false,
    sort_order: baseOrder + i + 1,
    tags: tags ?? null,
  }));

  const { data, error } = await supabase
    .from('checklist_items')
    .insert(rows)
    .select();

  if (error) {
    return { success: false, message: 'Nepodarilo se pridat polozky', error: error.message };
  }

  const titleList = titles.map((t) => t.trim()).join(', ');
  return {
    success: true,
    message: `Pridano ${titles.length} polozek do checklistu: ${titleList}`,
    data,
  };
}

async function completeChecklistItem(
  supabase: SupabaseClient,
  coupleId: string,
  params: { title: string }
): Promise<ActionResult> {
  const { title } = params;

  if (!title) {
    return { success: false, message: 'Chybí název položky', error: 'Missing title' };
  }

  // Find item by title (case-insensitive partial match)
  const { data: items } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('completed', false)
    .ilike('title', `%${title}%`);

  if (!items || items.length === 0) {
    return {
      success: false,
      message: `Nenašel jsem nehotovou položku "${title}" v checklistu`,
      error: 'Item not found',
    };
  }

  // Update first match
  const item = items[0];
  const { data, error } = await supabase
    .from('checklist_items')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', item.id)
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Nepodařilo se označit položku', error: error.message };
  }

  return {
    success: true,
    message: `Označil jsem "${item.title}" jako hotové`,
    data,
  };
}

async function removeChecklistItem(
  supabase: SupabaseClient,
  coupleId: string,
  params: { title: string }
): Promise<ActionResult> {
  const { title } = params;

  if (!title) {
    return { success: false, message: 'Chybí název položky', error: 'Missing title' };
  }

  // Find item by title
  const { data: items } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('couple_id', coupleId)
    .ilike('title', `%${title}%`);

  if (!items || items.length === 0) {
    return {
      success: false,
      message: `Nenašel jsem položku "${title}" v checklistu`,
      error: 'Item not found',
    };
  }

  const item = items[0];
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', item.id);

  if (error) {
    return { success: false, message: 'Nepodařilo se smazat položku', error: error.message };
  }

  return {
    success: true,
    message: `Smazal jsem "${item.title}" z checklistu`,
    data: { id: item.id },
  };
}

async function updateChecklistItem(
  supabase: SupabaseClient,
  coupleId: string,
  params: { title: string; updates: Record<string, any> }
): Promise<ActionResult> {
  const { title, updates } = params;

  if (!title) {
    return { success: false, message: 'Chybí název položky', error: 'Missing title' };
  }

  if (!updates || Object.keys(updates).length === 0) {
    return { success: false, message: 'Chybí co aktualizovat', error: 'Missing updates' };
  }

  // Find item by title (case-insensitive partial match), any completion state
  const { data: items } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('couple_id', coupleId)
    .ilike('title', `%${title}%`);

  if (!items || items.length === 0) {
    return {
      success: false,
      message: `Nenašel jsem položku "${title}" v checklistu`,
      error: 'Item not found',
    };
  }

  if (items.length > 1) {
    const list = items.map((i: { title: string }) => `"${i.title}"`).join(', ');
    return {
      success: false,
      message: `Našel jsem ${items.length} položky: ${list}. Kterou myslíš?`,
      error: 'Ambiguous',
    };
  }

  const item = items[0];

  // Build clean update object
  const cleanUpdates: Record<string, any> = { ...updates };

  // Handle due_date via parseCzechDate
  if (cleanUpdates.due_date) {
    const parsed = parseCzechDate(cleanUpdates.due_date);
    if (parsed) {
      cleanUpdates.due_date = parsed;
    } else {
      return {
        success: false,
        message: `Nerozumim datumu "${cleanUpdates.due_date}". Zkus format jako "28. brezna" nebo "za 2 tydny".`,
        error: 'Unparseable date',
      };
    }
  }

  // Handle tags_append: merge with existing tags
  if (cleanUpdates.tags_append) {
    const existingTags: string[] = item.tags ?? [];
    const appendTags: string[] = Array.isArray(cleanUpdates.tags_append) ? cleanUpdates.tags_append : [cleanUpdates.tags_append];
    cleanUpdates.tags = [...new Set([...existingTags, ...appendTags])];
    delete cleanUpdates.tags_append;
  }

  const { data, error } = await supabase
    .from('checklist_items')
    .update(cleanUpdates)
    .eq('id', item.id)
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Nepodařilo se aktualizovat položku', error: error.message };
  }

  return {
    success: true,
    message: `Aktualizoval jsem "${item.title}"`,
    data,
  };
}

// Budget actions

const VALID_BUDGET_CATEGORIES = [
  'venue', 'catering', 'photo', 'music', 'flowers',
  'attire', 'rings', 'decor', 'cake', 'transport', 'honeymoon', 'other',
];

const CATEGORY_MAP: Record<string, string> = {
  fotograf: 'photo', foto: 'photo', video: 'photo', fotografie: 'photo',
  hudba: 'music', dj: 'music', kapela: 'music', muzika: 'music',
  jidlo: 'catering', stravovani: 'catering', menu: 'catering',
  kvetiny: 'flowers', kytky: 'flowers', floristka: 'flowers',
  misto: 'venue', salonek: 'venue', zamek: 'venue',
  saty: 'attire', oblek: 'attire', obleceni: 'attire',
  prsteny: 'rings', snubni: 'rings', prsten: 'rings',
  dekorace: 'decor', vyzdoba: 'decor',
  dort: 'cake',
  doprava: 'transport', auto: 'transport', limuzina: 'transport',
  libanky: 'honeymoon', svatebni_cesta: 'honeymoon',
};

function normalizeBudgetCategory(category: string | undefined): string {
  if (!category) return 'other';
  const lower = category.toLowerCase();
  if (VALID_BUDGET_CATEGORIES.includes(lower)) return lower;
  return CATEGORY_MAP[lower] ?? 'other';
}

async function addBudgetItem(
  supabase: SupabaseClient,
  coupleId: string,
  params: { name: string; amount: number; category?: string; tags?: string[] }
): Promise<ActionResult> {
  const { name, amount, category, tags } = params;

  if (!name || amount == null || amount === undefined) {
    return { success: false, message: 'Chybí název nebo částka', error: 'Missing name or amount' };
  }

  const normalizedCategory = normalizeBudgetCategory(category);

  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      couple_id: coupleId,
      name,
      category: normalizedCategory,
      estimated_cost: amount,
      actual_cost: null,
      paid: false,
      source: 'ai',
      tags: tags ?? null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Nepodařilo se přidat výdaj', error: error.message };
  }

  return {
    success: true,
    message: `Přidal jsem "${name}" (${amount.toLocaleString('cs-CZ')} Kč) do rozpočtu`,
    data,
  };
}

async function addBudgetItems(
  supabase: SupabaseClient,
  coupleId: string,
  params: { items: { name: string; amount: number; category?: string }[] }
): Promise<ActionResult> {
  const { items } = params;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { success: false, message: 'Chybi polozky rozpoctu', error: 'Missing items array' };
  }

  const rows = items.map((item) => ({
    couple_id: coupleId,
    name: item.name,
    category: normalizeBudgetCategory(item.category),
    estimated_cost: item.amount,
    actual_cost: null,
    paid: false,
    source: 'ai',
  }));

  const { data, error } = await supabase
    .from('budget_items')
    .insert(rows)
    .select();

  if (error) {
    return { success: false, message: 'Nepodarilo se pridat polozky rozpoctu', error: error.message };
  }

  const itemList = items.map((item) => `${item.name} (${item.amount.toLocaleString('cs-CZ')} Kc)`).join(', ');
  return {
    success: true,
    message: `Pridano ${items.length} polozek do rozpoctu: ${itemList}`,
    data,
  };
}

async function updateBudgetItem(
  supabase: SupabaseClient,
  coupleId: string,
  params: { name: string; amount: number }
): Promise<ActionResult> {
  const { name, amount } = params;

  if (!name || !amount) {
    return { success: false, message: 'Chybí název nebo částka', error: 'Missing name or amount' };
  }

  // Find item by name
  const { data: items } = await supabase
    .from('budget_items')
    .select('*')
    .eq('couple_id', coupleId)
    .ilike('name', `%${name}%`);

  if (!items || items.length === 0) {
    return {
      success: false,
      message: `Nenašel jsem výdaj "${name}" v rozpočtu`,
      error: 'Item not found',
    };
  }

  const item = items[0];
  const { data, error } = await supabase
    .from('budget_items')
    .update({ estimated_cost: amount })
    .eq('id', item.id)
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Nepodařilo se aktualizovat výdaj', error: error.message };
  }

  return {
    success: true,
    message: `Aktualizoval jsem "${item.name}" na ${amount.toLocaleString('cs-CZ')} Kč`,
    data,
  };
}

async function removeBudgetItem(
  supabase: SupabaseClient,
  coupleId: string,
  params: { name: string }
): Promise<ActionResult> {
  const { name } = params;

  if (!name) {
    return { success: false, message: 'Chybí název výdaje', error: 'Missing name' };
  }

  // Find item by name
  const { data: items } = await supabase
    .from('budget_items')
    .select('*')
    .eq('couple_id', coupleId)
    .ilike('name', `%${name}%`);

  if (!items || items.length === 0) {
    return {
      success: false,
      message: `Nenašel jsem výdaj "${name}" v rozpočtu`,
      error: 'Item not found',
    };
  }

  const item = items[0];
  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', item.id);

  if (error) {
    return { success: false, message: 'Nepodařilo se smazat výdaj', error: error.message };
  }

  return {
    success: true,
    message: `Smazal jsem "${item.name}" z rozpočtu`,
    data: { id: item.id },
  };
}

async function markBudgetPaid(
  supabase: SupabaseClient,
  coupleId: string,
  params: { name: string; amount: number }
): Promise<ActionResult> {
  const { name, amount } = params;

  if (!name || amount == null) {
    return { success: false, message: 'Chybí název nebo částka', error: 'Missing name or amount' };
  }

  // Find item by name
  const { data: items } = await supabase
    .from('budget_items')
    .select('*')
    .eq('couple_id', coupleId)
    .ilike('name', `%${name}%`);

  if (!items || items.length === 0) {
    // Upsert: create new item and mark paid
    const { data, error } = await supabase
      .from('budget_items')
      .insert({
        couple_id: coupleId,
        name,
        category: normalizeBudgetCategory(name),
        estimated_cost: amount,
        actual_cost: amount,
        paid: true,
        source: 'ai',
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: 'Nepodařilo se přidat výdaj', error: error.message };
    }

    return {
      success: true,
      message: `Vytvořil jsem a označil "${name}" jako zaplaceno (${amount.toLocaleString('cs-CZ')} Kč)`,
      data,
    };
  }

  // Update first match -- preserve estimated_cost, only set actual_cost and paid
  const item = items[0];
  const { data, error } = await supabase
    .from('budget_items')
    .update({ paid: true, actual_cost: amount })
    .eq('id', item.id)
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Nepodařilo se označit jako zaplaceno', error: error.message };
  }

  return {
    success: true,
    message: `Označil jsem "${item.name}" jako zaplaceno (${amount.toLocaleString('cs-CZ')} Kč)`,
    data,
  };
}

// Guest actions

async function addGuest(
  supabase: SupabaseClient,
  coupleId: string,
  params: { name: string; group?: string }
): Promise<ActionResult> {
  const { name, group } = params;

  if (!name) {
    return { success: false, message: 'Chybí jméno hosta', error: 'Missing name' };
  }

  const { data, error } = await supabase
    .from('guests')
    .insert({
      couple_id: coupleId,
      name,
      group_name: group || null,
      rsvp_status: 'pending',
      plus_one: false,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Nepodařilo se přidat hosta', error: error.message };
  }

  return {
    success: true,
    message: `Přidal jsem ${name} na seznam hostů`,
    data,
  };
}

async function addGuests(
  supabase: SupabaseClient,
  coupleId: string,
  params: { names: string[]; group?: string }
): Promise<ActionResult> {
  const { names, group } = params;

  if (!names || !Array.isArray(names) || names.length === 0) {
    return { success: false, message: 'Chybi jmena hostu', error: 'Missing names array' };
  }

  const rows = names.map((name) => ({
    couple_id: coupleId,
    name: name.trim(),
    group_name: group || null,
    rsvp_status: 'pending',
    plus_one: false,
  }));

  const { data, error } = await supabase
    .from('guests')
    .insert(rows)
    .select();

  if (error) {
    return { success: false, message: 'Nepodarilo se pridat hosty', error: error.message };
  }

  const nameList = names.join(', ');
  const groupSuffix = group ? ` (${group})` : '';
  return {
    success: true,
    message: `Pridal jsem ${names.length} hostu na seznam: ${nameList}${groupSuffix}`,
    data,
  };
}

async function updateGuest(
  supabase: SupabaseClient,
  coupleId: string,
  params: { name: string; rsvp_status?: string; updates?: Record<string, any> }
): Promise<ActionResult> {
  const { name, rsvp_status, updates } = params;

  if (!name) {
    return { success: false, message: 'Chybí jméno hosta', error: 'Missing name' };
  }

  // Find guest by name
  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('couple_id', coupleId)
    .ilike('name', `%${name}%`);

  if (!guests || guests.length === 0) {
    return {
      success: false,
      message: `Nenašel jsem hosta "${name}" na seznamu`,
      error: 'Guest not found',
    };
  }

  const guest = guests[0];
  const updateData: Record<string, any> = { ...updates };

  if (rsvp_status) {
    updateData.rsvp_status = rsvp_status;
    updateData.rsvp_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('guests')
    .update(updateData)
    .eq('id', guest.id)
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Nepodařilo se aktualizovat hosta', error: error.message };
  }

  return {
    success: true,
    message: `Aktualizoval jsem údaje pro ${guest.name}`,
    data,
  };
}

async function removeGuest(
  supabase: SupabaseClient,
  coupleId: string,
  params: { name: string }
): Promise<ActionResult> {
  const { name } = params;

  if (!name) {
    return { success: false, message: 'Chybí jméno hosta', error: 'Missing name' };
  }

  // Find guest by name
  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('couple_id', coupleId)
    .ilike('name', `%${name}%`);

  if (!guests || guests.length === 0) {
    return {
      success: false,
      message: `Nenašel jsem hosta "${name}" na seznamu`,
      error: 'Guest not found',
    };
  }

  const guest = guests[0];
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', guest.id);

  if (error) {
    return { success: false, message: 'Nepodařilo se odstranit hosta', error: error.message };
  }

  return {
    success: true,
    message: `Odstranil jsem ${guest.name} ze seznamu hostů`,
    data: { id: guest.id },
  };
}

// Query handlers (read-only)

async function queryChecklist(
  supabase: SupabaseClient,
  coupleId: string,
  params: { filter?: string }
): Promise<ActionResult> {
  const filter = params.filter ?? 'all';
  const today = new Date().toISOString().split('T')[0];

  const { data: items, error } = await supabase
    .from('checklist_items')
    .select('title, completed, due_date, priority, tags')
    .eq('couple_id', coupleId)
    .order('due_date', { ascending: true });

  if (error) {
    return { success: false, message: 'Nepodarilo se nacist checklist', error: error.message };
  }

  const all = items ?? [];
  const totalCount = all.length;
  const completedCount = all.filter((i: { completed: boolean }) => i.completed).length;
  const pendingCount = totalCount - completedCount;

  let filtered: typeof all;
  switch (filter) {
    case 'overdue':
      filtered = all.filter((i: { completed: boolean; due_date: string | null }) =>
        !i.completed && i.due_date && i.due_date < today
      );
      break;
    case 'pending':
      filtered = all.filter((i: { completed: boolean }) => !i.completed);
      break;
    case 'completed':
      filtered = all.filter((i: { completed: boolean }) => i.completed);
      break;
    default:
      filtered = all;
  }

  const lines = filtered.slice(0, 15).map((i: { title: string; due_date: string | null; tags: string[] | null }) => {
    const datePart = i.due_date ? ` (do ${i.due_date})` : '';
    const tagPart = i.tags && i.tags.length > 0 ? ` [${i.tags.join(', ')}]` : '';
    return `- ${i.title}${datePart}${tagPart}`;
  });

  const overdueSuffix = filter !== 'overdue'
    ? `, ${all.filter((i: { completed: boolean; due_date: string | null }) => !i.completed && i.due_date && i.due_date < today).length} po terminu`
    : '';

  const header = `Checklist: ${completedCount} hotovych, ${pendingCount} nesplnenych${overdueSuffix}.`;
  const contextString = filtered.length > 0
    ? `${header}\n${lines.join('\n')}`
    : `${header}\nZadne polozky pro tento filtr.`;

  return {
    success: true,
    message: contextString,
    data: { type: 'query', context: contextString },
  };
}

async function queryBudget(
  supabase: SupabaseClient,
  coupleId: string,
  params: { filter?: string }
): Promise<ActionResult> {
  const filter = params.filter ?? 'all';

  const [itemsResult, coupleResult] = await Promise.all([
    supabase
      .from('budget_items')
      .select('name, category, estimated_cost, actual_cost, paid, tags')
      .eq('couple_id', coupleId),
    supabase
      .from('couples')
      .select('budget_total')
      .eq('id', coupleId)
      .single(),
  ]);

  if (itemsResult.error) {
    return { success: false, message: 'Nepodarilo se nacist rozpocet', error: itemsResult.error.message };
  }

  const all = itemsResult.data ?? [];
  const budgetTotal: number | null = coupleResult.data?.budget_total ?? null;

  const totalEstimated = all.reduce((sum: number, i: { estimated_cost: number | null }) => sum + (i.estimated_cost ?? 0), 0);
  const totalPaid = all
    .filter((i: { paid: boolean }) => i.paid)
    .reduce((sum: number, i: { actual_cost: number | null; estimated_cost: number | null }) => sum + (i.actual_cost ?? i.estimated_cost ?? 0), 0);
  const paidCount = all.filter((i: { paid: boolean }) => i.paid).length;
  const unpaidCount = all.length - paidCount;
  const paidPct = totalEstimated > 0 ? Math.round((totalPaid / totalEstimated) * 100) : 0;
  const remaining = budgetTotal != null ? budgetTotal - totalPaid : totalEstimated - totalPaid;

  let filtered: typeof all;
  switch (filter) {
    case 'unpaid':
      filtered = all.filter((i: { paid: boolean }) => !i.paid);
      break;
    case 'paid':
      filtered = all.filter((i: { paid: boolean }) => i.paid);
      break;
    default:
      filtered = all;
  }

  const lines = filtered.slice(0, 15).map((i: { name: string; estimated_cost: number | null; actual_cost: number | null; paid: boolean; tags: string[] | null }) => {
    const cost = i.paid ? (i.actual_cost ?? i.estimated_cost ?? 0) : (i.estimated_cost ?? 0);
    const paidMark = i.paid ? ' [zaplaceno]' : '';
    const tagPart = i.tags && i.tags.length > 0 ? ` [${i.tags.join(', ')}]` : '';
    return `- ${i.name}: ${cost.toLocaleString('cs-CZ')} Kc${paidMark}${tagPart}`;
  });

  const remainingLine = budgetTotal != null
    ? ` Rozpocet: ${budgetTotal.toLocaleString('cs-CZ')} Kc celkem, zbyva ${remaining.toLocaleString('cs-CZ')} Kc.`
    : ` Odhadovano celkem: ${totalEstimated.toLocaleString('cs-CZ')} Kc, zbyva zaplatit: ${remaining.toLocaleString('cs-CZ')} Kc.`;

  const header = `Rozpocet: ${totalEstimated.toLocaleString('cs-CZ')} Kc odhadovano, ${totalPaid.toLocaleString('cs-CZ')} Kc zaplaceno (${paidPct}%). ${paidCount} polozek zaplaceno, ${unpaidCount} nezaplaceno.${remainingLine}`;
  const contextString = filtered.length > 0
    ? `${header}\n${lines.join('\n')}`
    : `${header}\nZadne polozky pro tento filtr.`;

  return {
    success: true,
    message: contextString,
    data: { type: 'query', context: contextString },
  };
}

async function queryGuests(
  supabase: SupabaseClient,
  coupleId: string,
  params: { filter?: string }
): Promise<ActionResult> {
  const filter = params.filter ?? 'all';

  const { data: all, error } = await supabase
    .from('guests')
    .select('name, group_name, rsvp_status, plus_one, tags')
    .eq('couple_id', coupleId);

  if (error) {
    return { success: false, message: 'Nepodarilo se nacist hosty', error: error.message };
  }

  const guests = all ?? [];
  const totalCount = guests.length;
  const confirmedCount = guests.filter((g: { rsvp_status: string }) => g.rsvp_status === 'confirmed').length;
  const pendingCount = guests.filter((g: { rsvp_status: string }) => g.rsvp_status === 'pending').length;
  const declinedCount = guests.filter((g: { rsvp_status: string }) => g.rsvp_status === 'declined').length;

  let filtered: typeof guests;
  switch (filter) {
    case 'confirmed':
      filtered = guests.filter((g: { rsvp_status: string }) => g.rsvp_status === 'confirmed');
      break;
    case 'pending':
      filtered = guests.filter((g: { rsvp_status: string }) => g.rsvp_status === 'pending');
      break;
    case 'declined':
      filtered = guests.filter((g: { rsvp_status: string }) => g.rsvp_status === 'declined');
      break;
    default:
      filtered = guests;
  }

  const lines = filtered.slice(0, 15).map((g: { name: string; group_name: string | null; rsvp_status: string; plus_one: boolean; tags: string[] | null }) => {
    const groupPart = g.group_name ? ` (${g.group_name})` : '';
    const plusPart = g.plus_one ? ' +1' : '';
    const tagPart = g.tags && g.tags.length > 0 ? ` [${g.tags.join(', ')}]` : '';
    const status = g.rsvp_status === 'confirmed' ? 'potvrzeno' : g.rsvp_status === 'declined' ? 'odmítnuto' : 'ceka';
    return `- ${g.name}${groupPart}${plusPart}: ${status}${tagPart}`;
  });

  const header = `Hoste: ${totalCount} celkem, ${confirmedCount} potvrzenych, ${pendingCount} cekajicich, ${declinedCount} odmitnutych.`;
  const contextString = filtered.length > 0
    ? `${header}\n${lines.join('\n')}`
    : `${header}\nZadni hoste pro tento filtr.`;

  return {
    success: true,
    message: contextString,
    data: { type: 'query', context: contextString },
  };
}

async function statusOverview(
  supabase: SupabaseClient,
  coupleId: string
): Promise<ActionResult> {
  const today = new Date().toISOString().split('T')[0];

  const [checklistResult, budgetResult, guestsResult, coupleResult] = await Promise.all([
    supabase.from('checklist_items').select('completed, due_date').eq('couple_id', coupleId),
    supabase.from('budget_items').select('estimated_cost, actual_cost, paid').eq('couple_id', coupleId),
    supabase.from('guests').select('rsvp_status').eq('couple_id', coupleId),
    supabase.from('couples').select('budget_total').eq('id', coupleId).single(),
  ]);

  // Checklist summary
  const checklistItems = checklistResult.data ?? [];
  const totalTasks = checklistItems.length;
  const doneTasks = checklistItems.filter((i: { completed: boolean }) => i.completed).length;
  const overdueTasks = checklistItems.filter(
    (i: { completed: boolean; due_date: string | null }) => !i.completed && i.due_date && i.due_date < today
  ).length;
  const donePercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const checklistLine = `Checklist: ${doneTasks}/${totalTasks} hotovo (${donePercent}%)${overdueTasks > 0 ? `, ${overdueTasks} po terminu` : ''}.`;

  // Budget summary
  const budgetItems = budgetResult.data ?? [];
  const totalEstimated = budgetItems.reduce((s: number, i: { estimated_cost: number | null }) => s + (i.estimated_cost ?? 0), 0);
  const totalPaid = budgetItems
    .filter((i: { paid: boolean }) => i.paid)
    .reduce((s: number, i: { actual_cost: number | null; estimated_cost: number | null }) => s + (i.actual_cost ?? i.estimated_cost ?? 0), 0);
  const budgetTotal: number | null = coupleResult.data?.budget_total ?? null;
  const remaining = budgetTotal != null ? budgetTotal - totalPaid : totalEstimated - totalPaid;
  const budgetLine = `Rozpocet: ${totalEstimated.toLocaleString('cs-CZ')} Kc odhadovano, ${totalPaid.toLocaleString('cs-CZ')} Kc zaplaceno, zbyva ${remaining.toLocaleString('cs-CZ')} Kc${budgetTotal ? ` z ${budgetTotal.toLocaleString('cs-CZ')} Kc celkoveho rozpoctu` : ''}.`;

  // Guest summary
  const guestItems = guestsResult.data ?? [];
  const totalGuests = guestItems.length;
  const confirmedGuests = guestItems.filter((g: { rsvp_status: string }) => g.rsvp_status === 'confirmed').length;
  const pendingGuests = guestItems.filter((g: { rsvp_status: string }) => g.rsvp_status === 'pending').length;
  const guestLine = `Hoste: ${totalGuests} celkem, ${confirmedGuests} potvrzenych, ${pendingGuests} cekajicich.`;

  const contextString = `Prehled priprav:\n${checklistLine}\n${budgetLine}\n${guestLine}`;

  return {
    success: true,
    message: contextString,
    data: { type: 'query', context: contextString },
  };
}
