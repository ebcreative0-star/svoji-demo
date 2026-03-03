/**
 * Demand Signal Logger
 * Logs vendor search intents to demand_signals table
 * Used for building marketplace and matching couples with vendors
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface DemandSignal {
  category: string;
  region?: string;
  budget_hint?: number;
  urgency?: 'low' | 'medium' | 'high';
}

/**
 * Log vendor search demand signal (async, fire-and-forget)
 */
export async function logDemandSignal(
  supabase: SupabaseClient,
  coupleId: string,
  signal: DemandSignal,
  rawMessage: string,
  sourceIntent: 'vendor_search' | 'budget_add' = 'vendor_search'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('demand_signals')
      .insert({
        couple_id: coupleId,
        category: signal.category,
        region: signal.region || null,
        budget_hint: signal.budget_hint || null,
        urgency: signal.urgency || 'medium',
        raw_message: rawMessage,
        source_intent: sourceIntent,
      });

    if (error) {
      console.error('Failed to log demand signal:', error);
      // Don't throw - this is fire-and-forget
    }
  } catch (error) {
    console.error('Demand signal logging error:', error);
    // Don't throw - this is fire-and-forget
  }
}

/**
 * Extract demand signal parameters from intent classification.
 * For budget_add intents, maps params.name to category and params.amount to budget_hint.
 */
export function extractDemandSignal(
  params: Record<string, any>,
  sourceIntent?: string
): DemandSignal | null {
  const category = params.category || (sourceIntent === 'budget_add' ? params.name : null);

  if (!category) {
    return null;
  }

  return {
    category,
    region: params.region,
    budget_hint: params.amount || params.budget_hint,
    urgency: params.urgency && ['low', 'medium', 'high'].includes(params.urgency)
      ? params.urgency
      : 'medium',
  };
}
