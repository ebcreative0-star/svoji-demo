/**
 * Intent Classifier
 * Uses Kilo Gateway with cheaper/faster model to classify user intents
 */

const KILO_BASE_URL = 'https://api.kilo.ai/api/gateway';
// Use faster/cheaper model for classification
const CLASSIFICATION_MODEL = 'anthropic/claude-haiku-4.5';

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
- guest_add_multi: Pridat vice hostu najednou (params: { names: string[], group?: string })
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
- Pro checklist_complete: title je přibližný název položky (nemusí přesně odpovídat)
- Pro guest_add: extrahuj group pokud je zminen ("ze strany zenicha/nevesty", "rodina", "kamaradi" atd.)
- Pokud zprava obsahuje vice jmen oddelenych carkou nebo "a", pouzij guest_add_multi s polem names[]
- DULEZITE: Pokud zprava zminuje ze neco je "hotove", "zarizene", "odskrtnute" nebo "splnene", klasifikuj jako checklist_complete (ne small_talk)
- DULEZITE: Pokud uzivatel zminuje castku A nazev polozky, VZDY klasifikuj jako budget_add s params { name, amount, category }. Bez castky klasifikuj jako advice_request.
- DULEZITE: Pokud uzivatel chce neco smazat/zrusit/odstranit z rozpoctu, klasifikuj jako budget_remove.
- Pro budget_add category pouzij jednu z: venue|catering|photo|music|flowers|attire|rings|decor|cake|transport|honeymoon|other

PRIKLADY:
Uzivatel: "Odskrtni cirkus"
{"intent": "checklist_complete", "confidence": 0.95, "params": {"title": "cirkus"}}

Uzivatel: "Odskrtni fotografa"
{"intent": "checklist_complete", "confidence": 0.95, "params": {"title": "fotograf"}}

Uzivatel: "Pridej fotografa do checklistu"
{"intent": "checklist_add", "confidence": 0.95, "params": {"title": "fotograf"}}

Uzivatel: "Mame 50000 na catering"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "catering", "amount": 50000}}

Uzivatel: "Pridej polozku do rozpoctu"
{"intent": "budget_add", "confidence": 0.65, "params": {}}

Uzivatel: "Pozveme tetu Martu"
{"intent": "guest_add", "confidence": 0.95, "params": {"name": "Marta"}}

Uzivatel: "Pozveme tetu Martu ze strany zenicha"
{"intent": "guest_add", "confidence": 0.95, "params": {"name": "Marta", "group": "strana zenicha"}}

Uzivatel: "Pridej rodinu Novych"
{"intent": "guest_add", "confidence": 0.95, "params": {"name": "rodina Novych", "group": "rodina"}}

Uzivatel: "Pozveme Marka, Janu a Petra"
{"intent": "guest_add_multi", "confidence": 0.95, "params": {"names": ["Marek", "Jana", "Petr"]}}

Uzivatel: "Pozveme Marka, Janu a Petra ze strany nevesty"
{"intent": "guest_add_multi", "confidence": 0.95, "params": {"names": ["Marek", "Jana", "Petr"], "group": "strana nevesty"}}

Uzivatel: "Pridej Tomas a Lucii"
{"intent": "guest_add_multi", "confidence": 0.95, "params": {"names": ["Tomas", "Lucie"]}}

Uzivatel: "Pridej fotografa za 25000"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "fotograf", "amount": 25000, "category": "photo"}}

Uzivatel: "Rozpocet na kvetiny 8000"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "kvetiny", "amount": 8000, "category": "flowers"}}

Uzivatel: "Catering bude stat 80000"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "catering", "amount": 80000, "category": "catering"}}

Uzivatel: "Pridej do rozpoctu DJ 15000"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "DJ", "amount": 15000, "category": "music"}}

Uzivatel: "Pridej catering 50000 do rozpoctu"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "catering", "amount": 50000, "category": "catering"}}

Uzivatel: "Smaz dort z rozpoctu"
{"intent": "budget_remove", "confidence": 0.95, "params": {"name": "dort"}}

Uzivatel: "Smaz kvetiny z rozpoctu"
{"intent": "budget_remove", "confidence": 0.95, "params": {"name": "kvetiny"}}

Uzivatel: "Zrus polozku catering"
{"intent": "budget_remove", "confidence": 0.95, "params": {"name": "catering"}}

Uzivatel: "Nechci uz dort v rozpoctu"
{"intent": "budget_remove", "confidence": 0.95, "params": {"name": "dort"}}

Uzivatel: "Kolik stoji fotograf?"
{"intent": "advice_request", "confidence": 0.95, "params": {}}

Uzivatel: "Jaky je rozdil mezi DJ a kapelou?"
{"intent": "advice_request", "confidence": 0.95, "params": {}}

Uzivatel: "Ahoj, jak se mas?"
{"intent": "small_talk", "confidence": 0.95, "params": {}}

Uzivatel: "Hledame fotografa v Brne"
{"intent": "vendor_search", "confidence": 0.95, "params": {"category": "fotograf", "region": "Brno"}}

Uzivatel: "Mame hotovo s fotografem"
{"intent": "checklist_complete", "confidence": 0.95, "params": {"title": "fotograf"}}

Uzivatel: "Fotograf je zarizenej"
{"intent": "checklist_complete", "confidence": 0.95, "params": {"title": "fotograf"}}

Uzivatel: "Zaplaceno 30000 za kvetiny"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "kvetiny", "amount": 30000}}

Uzivatel: "Na muziku davame 15000"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "muzika", "amount": 15000}}

Uzivatel: "Oznac dort jako hotovy"
{"intent": "checklist_complete", "confidence": 0.95, "params": {"title": "dort"}}`;

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
        temperature: 0.1, // Lower temperature for more deterministic classification
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

    // Parse JSON response - strip markdown code fences if present
    const cleaned = content.trim().replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    const result = JSON.parse(cleaned) as IntentResult;

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
    'guest_add_multi',
    'guest_update',
    'guest_remove',
  ];

  return actionIntents.includes(intent);
}

/**
 * Determine if intent should log demand signal
 */
export function isDemandSignal(intent: string): boolean {
  return intent === 'vendor_search' || intent === 'budget_add';
}
