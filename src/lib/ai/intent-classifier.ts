/**
 * Intent Classifier
 * Uses Kilo Gateway with cheaper/faster model to classify user intents
 */

const KILO_BASE_URL = 'https://api.kilo.ai/api/gateway';
// Use faster/cheaper model for classification
const CLASSIFICATION_MODEL = 'anthropic/claude-haiku-4.0';

export interface IntentResult {
  intent: string;
  confidence: number;
  params: Record<string, any>;
}

const CLASSIFICATION_SYSTEM_PROMPT = `Jsi klasifikator zámeru uživatelských zpráv pro svatební plánovací aplikaci.

MOŽNÉ INTENTY:

**Akce s daty (mění databázi):**
- checklist_add: Přidat položku do checklistu (params: { title: string, category?: string })
- checklist_complete: Označit položku jako hotovou (params: { title: string })
- checklist_remove: Smazat položku (params: { title: string })
- budget_add: Přidat výdaj (params: { name: string, amount: number, category?: string })
- budget_update: Aktualizovat částku (params: { name: string, amount: number })
- budget_remove: Smazat výdaj (params: { name: string })
- guest_add: Přidat hosta (params: { name: string, group?: string })
- guest_update: Změnit RSVP/detaily (params: { name: string, rsvp_status?: string, updates?: object })
- guest_remove: Odstranit hosta (params: { name: string })

**Informační intenty (pouze logování):**
- vendor_search: Hledání dodavatele (params: { category: string, region?: string, budget_hint?: number })
- advice_request: Obecná rada o svatbě
- small_talk: Konverzace mimo téma

NÁVRATOVÝ FORMÁT (POUZE JSON, BEZ KOMENTÁŘŮ):
{
  "intent": "název_intentu",
  "confidence": 0.0-1.0,
  "params": { ... }
}

PRAVIDLA:
- Odpovídej POUZE validním JSON objektem
- Žádné úvodní texty ani vysvětlení
- Confidence: >0.9 = jasné, 0.7-0.9 = pravděpodobné, <0.7 = nejisté
- Params musí obsahovat všechny extrahované informace z textu
- Pro vendor_search extrahuj: category (fotograf, catering, místo, DJ, květiny, atd.), region pokud zmíněn, budget_hint pokud zmíněn
- Pro checklist_add/budget_add: title/name je text položky v češtině
- Pro checklist_complete: title je přibližný název položky (nemusí přesně odpovídat)`;

/**
 * Classify user message intent using Kilo Gateway
 */
export async function classifyIntent(
  message: string,
  conversationContext?: string[]
): Promise<IntentResult> {
  const apiKey = process.env.KILO_API_KEY;

  if (!apiKey) {
    console.warn('KILO_API_KEY not configured - intent classification disabled');
    return {
      intent: 'unknown',
      confidence: 0,
      params: {},
    };
  }

  const contextStr = conversationContext?.length
    ? `\n\nKontext předchozí konverzace:\n${conversationContext.slice(-3).join('\n')}`
    : '';

  const userPrompt = `Zpráva uživatele: "${message}"${contextStr}

Klasifikuj záměr a vrať JSON.`;

  try {
    const response = await fetch(`${KILO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CLASSIFICATION_MODEL,
        messages: [
          { role: 'system', content: CLASSIFICATION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 256,
        temperature: 0.3, // Lower temperature for more consistent classification
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Kilo API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in classification response');
    }

    // Parse JSON response
    const result = JSON.parse(content.trim()) as IntentResult;

    // Validate result structure
    if (!result.intent || typeof result.confidence !== 'number') {
      throw new Error('Invalid classification result structure');
    }

    return result;
  } catch (error) {
    console.error('Intent classification failed:', error);
    // Return unknown intent on error
    return {
      intent: 'unknown',
      confidence: 0,
      params: {},
    };
  }
}

/**
 * Determine if intent requires action execution
 */
export function isActionIntent(intent: string): boolean {
  const actionIntents = [
    'checklist_add',
    'checklist_complete',
    'checklist_remove',
    'budget_add',
    'budget_update',
    'budget_remove',
    'guest_add',
    'guest_update',
    'guest_remove',
  ];

  return actionIntents.includes(intent);
}

/**
 * Determine if intent should log demand signal
 */
export function isDemandSignal(intent: string): boolean {
  return intent === 'vendor_search';
}
