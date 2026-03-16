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
    cleanUpdates.due_date = parsed ?? cleanUpdates.due_date;
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
