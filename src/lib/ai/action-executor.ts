/**
 * Action Executor
 * Executes database mutations based on classified intents
 */

import { SupabaseClient } from '@supabase/supabase-js';

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
        return await addChecklistItem(supabase, coupleId, params as { title: string; category?: string });
      case 'checklist_complete':
        return await completeChecklistItem(supabase, coupleId, params as { title: string });
      case 'checklist_remove':
        return await removeChecklistItem(supabase, coupleId, params as { title: string });

      // Budget actions
      case 'budget_add':
        return await addBudgetItem(supabase, coupleId, params as { name: string; amount: number; category?: string });
      case 'budget_update':
        return await updateBudgetItem(supabase, coupleId, params as { name: string; amount: number });
      case 'budget_remove':
        return await removeBudgetItem(supabase, coupleId, params as { name: string });

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
  params: { title: string; category?: string }
): Promise<ActionResult> {
  const { title, category } = params;

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
      due_date: null,
      priority: 'medium',
      completed: false,
      sort_order: nextSortOrder,
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

// Budget actions

async function addBudgetItem(
  supabase: SupabaseClient,
  coupleId: string,
  params: { name: string; amount: number; category?: string }
): Promise<ActionResult> {
  const { name, amount, category } = params;

  if (!name || !amount) {
    return { success: false, message: 'Chybí název nebo částka', error: 'Missing name or amount' };
  }

  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      couple_id: coupleId,
      name,
      category: category || 'other',
      estimated_cost: amount,
      actual_cost: null,
      paid: false,
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
