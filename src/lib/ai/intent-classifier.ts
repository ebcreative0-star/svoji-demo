/**
 * Intent Classifier
 * Uses NLP.js as primary classifier with Kilo Gateway (Haiku) as fallback
 * for low-confidence results (< 0.5).
 *
 * Zero API cost for ~95% of classifications; deterministic, < 50ms latency on warm path.
 */
import { getNlpClassifier } from './nlp-classifier';

const KILO_BASE_URL = 'https://api.kilo.ai/api/gateway';
// Use faster/cheaper model for classification (fallback only)
const CLASSIFICATION_MODEL = 'anthropic/claude-haiku-4.5';

export interface IntentResult {
  intent: string;
  confidence: number;
  params: Record<string, any>;
}

const CLASSIFICATION_SYSTEM_PROMPT = `Jsi klasifikator zámeru uživatelských zpráv pro svatební plánovací aplikaci.

MOŽNÉ INTENTY:

**Akce s daty (mění databázi):**
- checklist_add: Přidat novou položku do checklistu (params: { title: string, category?: string, tags?: string[] }). category je JEDNA Z: venue|attire|vendors|guests|decor|admin|ceremony|other. Mapovani: Fotograf/DJ/catering/floristka = vendors, Saty/oblek = attire, Misto/salonek/zamek = venue, Pozvanky/hoste = guests, Dekorace/kytky = decor, Doklady/smlouvy = admin, Obrad/ritualy = ceremony.
- checklist_update: Aktualizovat existujici polozku v checklistu (params: { title: string, updates: { due_date?: string, priority?: string, category?: string, description?: string, tags_append?: string[] } })
- checklist_complete: Označit položku jako hotovou (params: { title: string })
- checklist_remove: Smazat položku (params: { title: string })
- budget_add: Přidat výdaj (params: { name: string, amount: number, category?: string, tags?: string[] })
- budget_mark_paid: Oznacit vydaj jako zaplaceny nebo zaznamenat platbu (params: { name: string, amount: number })
- budget_update: Aktualizovat částku (params: { name: string, amount: number })
- budget_remove: Smazat výdaj (params: { name: string })
- checklist_add_multi: Pridat vice polozek do checklistu najednou (params: { titles: string[], category?: string })
- budget_add_multi: Pridat vice vydaju najednou (params: { items: { name: string, amount: number, category?: string }[] })
- guest_add: Přidat hosta (params: { name: string, group?: string })
- guest_add_multi: Pridat vice hostu najednou (params: { names: string[], group?: string })
- guest_update: Změnit RSVP/detaily (params: { name: string, rsvp_status?: string, updates?: object })
- guest_remove: Odstranit hosta (params: { name: string })

**Dotazy na data (pouze cteni):**
- checklist_query: Dotaz na stav checklistu (params: { filter?: 'overdue' | 'pending' | 'completed' | 'all' })
- budget_query: Dotaz na stav rozpoctu (params: { filter?: 'unpaid' | 'paid' | 'all' })
- guest_query: Dotaz na hosty (params: { filter?: 'confirmed' | 'pending' | 'declined' | 'all' })
- status_overview: Celkovy prehled priprav -- cross-domain summary (params: {})

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
- PRAVIDLO: Dotazy 'kolik/co/kdo/jak' BEZ akce (pridej/smaz/uprav) = query intent. Dotazy s akci = action intent.
- Pro vendor_search extrahuj: category (fotograf, catering, místo, DJ, květiny, atd.), region pokud zmíněn, budget_hint pokud zmíněn
- Pro checklist_add/budget_add: title/name je text položky v češtině
- Pro checklist_complete: title je přibližný název položky (nemusí přesně odpovídat)
- Pro guest_add: extrahuj group pokud je zminen ("ze strany zenicha/nevesty", "rodina", "kamaradi" atd.)
- Pokud zprava obsahuje vice jmen oddelenych carkou nebo "a", pouzij guest_add_multi s polem names[]
- Pokud uzivatel zminuje VICE polozek pro checklist (oddelene carkou, "a", nebo na vice radcich), pouzij checklist_add_multi s polem titles[]
- Pokud uzivatel zminuje VICE rozpoctovych polozek s castkami (vice nez jednu), pouzij budget_add_multi s polem items[]
- DULEZITE: Pokud zprava zminuje ze neco je "hotove", "zarizene", "odskrtnute" nebo "splnene", klasifikuj jako checklist_complete (ne small_talk)
- DULEZITE: Pokud uzivatel zminuje castku A nazev polozky (jednu), VZDY klasifikuj jako budget_add s params { name, amount, category }. Bez castky klasifikuj jako advice_request.
- DULEZITE: Pokud uzivatel chce neco smazat/zrusit/odstranit z rozpoctu, klasifikuj jako budget_remove.
- Pro budget_add/budget_add_multi category pouzij jednu z: venue|catering|photo|music|flowers|attire|rings|decor|cake|transport|honeymoon|other
- DULEZITE: Rozlisuj update vs create. "pridej [neco] K [polozce]" = checklist_update (predlozka K/k). "pridej [polozku]" = checklist_add. Klicova slova pro update: nastav, uprav, zmen, aktualizuj, pridej datum/tag/prioritu K.
- DULEZITE: "zaplatil jsem [nazev] [castka]" nebo "zaplaceno [castka] za [nazev]" nebo "uhradil jsem" = budget_mark_paid (ne budget_add).
- DULEZITE: Pro checklist_add: pokud nazev polozky odpovida Fotograf/DJ/catering/floristka, nastav category na "vendors". Misto/salonek/zamek = "venue". Saty/oblek = "attire". Dekorace/kytky = "decor". Doklady/smlouvy = "admin". Obrad = "ceremony".

PRIKLADY:
Uzivatel: "Odskrtni cirkus"
{"intent": "checklist_complete", "confidence": 0.95, "params": {"title": "cirkus"}}

Uzivatel: "Odskrtni fotografa"
{"intent": "checklist_complete", "confidence": 0.95, "params": {"title": "fotograf"}}

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
{"intent": "budget_mark_paid", "confidence": 0.95, "params": {"name": "kvetiny", "amount": 30000}}

Uzivatel: "Zaplatil jsem fotografa 25000"
{"intent": "budget_mark_paid", "confidence": 0.95, "params": {"name": "fotograf", "amount": 25000}}

Uzivatel: "Uhradil jsem catering 80000"
{"intent": "budget_mark_paid", "confidence": 0.95, "params": {"name": "catering", "amount": 80000}}

Uzivatel: "Pridej datum 15. kvetna k fotografovi"
{"intent": "checklist_update", "confidence": 0.95, "params": {"title": "fotograf", "updates": {"due_date": "15. kvetna"}}}

Uzivatel: "Nastav prioritu fotografa na vysoka"
{"intent": "checklist_update", "confidence": 0.95, "params": {"title": "fotograf", "updates": {"priority": "high"}}}

Uzivatel: "Zmen kategorii fotografa na vendors"
{"intent": "checklist_update", "confidence": 0.95, "params": {"title": "fotograf", "updates": {"category": "vendors"}}}

Uzivatel: "Pridej tag urgent k fotografovi"
{"intent": "checklist_update", "confidence": 0.95, "params": {"title": "fotograf", "updates": {"tags_append": ["urgent"]}}}

Uzivatel: "Pridej fotografa s tagem dodavatel"
{"intent": "checklist_add", "confidence": 0.95, "params": {"title": "fotograf", "category": "vendors", "tags": ["dodavatel"]}}

Uzivatel: "Pridej fotografa do checklistu"
{"intent": "checklist_add", "confidence": 0.95, "params": {"title": "fotograf", "category": "vendors"}}

Uzivatel: "Pridej catering do checklistu"
{"intent": "checklist_add", "confidence": 0.95, "params": {"title": "catering", "category": "vendors"}}

Uzivatel: "Pridej fotografa za 25000"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "fotograf", "amount": 25000, "category": "photo"}}

Uzivatel: "Na muziku davame 15000"
{"intent": "budget_add", "confidence": 0.95, "params": {"name": "muzika", "amount": 15000}}

Uzivatel: "Oznac dort jako hotovy"
{"intent": "checklist_complete", "confidence": 0.95, "params": {"title": "dort"}}

Uzivatel: "Pridej fotograf, DJ a catering do checklistu"
{"intent": "checklist_add_multi", "confidence": 0.95, "params": {"titles": ["fotograf", "DJ", "catering"]}}

Uzivatel: "Do checklistu: vybrat misto, objednat catering, sehnat fotografa"
{"intent": "checklist_add_multi", "confidence": 0.95, "params": {"titles": ["vybrat misto", "objednat catering", "sehnat fotografa"]}}

Uzivatel: "Fotograf 25000, DJ 15000, kvetiny 8000"
{"intent": "budget_add_multi", "confidence": 0.95, "params": {"items": [{"name": "fotograf", "amount": 25000, "category": "photo"}, {"name": "DJ", "amount": 15000, "category": "music"}, {"name": "kvetiny", "amount": 8000, "category": "flowers"}]}}

Uzivatel: "Rozpocet: catering 80000, dort 12000, dekorace 15000"
{"intent": "budget_add_multi", "confidence": 0.95, "params": {"items": [{"name": "catering", "amount": 80000, "category": "catering"}, {"name": "dort", "amount": 12000, "category": "cake"}, {"name": "dekorace", "amount": 15000, "category": "decor"}]}}

Uzivatel: "co mam v checklistu?"
{"intent": "checklist_query", "confidence": 0.95, "params": {"filter": "all"}}

Uzivatel: "co je po terminu?"
{"intent": "checklist_query", "confidence": 0.95, "params": {"filter": "overdue"}}

Uzivatel: "co mi zbyva?"
{"intent": "checklist_query", "confidence": 0.95, "params": {"filter": "pending"}}

Uzivatel: "kolik mam v rozpoctu?"
{"intent": "budget_query", "confidence": 0.95, "params": {"filter": "all"}}

Uzivatel: "kolik zbývá zaplatit?"
{"intent": "budget_query", "confidence": 0.95, "params": {"filter": "unpaid"}}

Uzivatel: "co uz je zaplacene?"
{"intent": "budget_query", "confidence": 0.95, "params": {"filter": "paid"}}

Uzivatel: "kolik hostu potvrdilo?"
{"intent": "guest_query", "confidence": 0.95, "params": {"filter": "confirmed"}}

Uzivatel: "kdo jeste neodpovedel?"
{"intent": "guest_query", "confidence": 0.95, "params": {"filter": "pending"}}

Uzivatel: "jak jsem na tom?"
{"intent": "status_overview", "confidence": 0.95, "params": {}}

Uzivatel: "shrn mi stav priprav"
{"intent": "status_overview", "confidence": 0.95, "params": {}}

Uzivatel: "kolik toho jeste mam?"
{"intent": "status_overview", "confidence": 0.95, "params": {}}`;

/**
 * Extract params from NLP.js result for a given intent.
 * Best-effort extraction -- Sonnet further refines params in the chat response.
 * The key job of NLP.js is getting the intent right; params are supplementary.
 */
function extractParams(intent: string, entities: any[], message: string): Record<string, any> {
  const params: Record<string, any> = {};

  // Budget intents: extract amount via regex, extract name from entities or message text
  if (intent === 'budget_add' || intent === 'budget_mark_paid' || intent === 'budget_update') {
    const amountMatch = message.match(/\b(\d[\d\s]*)\b/);
    if (amountMatch) {
      params.amount = parseInt(amountMatch[1].replace(/\s/g, ''), 10);
    }
    // Try to get name from entities first
    const nameEntity = entities.find((e: any) => e.type === 'trim' || e.entity === 'name');
    if (nameEntity) {
      params.name = nameEntity.sourceText ?? nameEntity.utteranceText ?? nameEntity.option;
    } else {
      // Fallback: strip common prefixes and numbers to get the item name
      const namePart = message
        .replace(/\b\d[\d\s]*\b/g, '')
        .replace(/^(zaplatil jsem|zaplaceno za|uhradil jsem|pridej do rozpoctu|pridej|přidej)\s*/i, '')
        .replace(/\s+(do\s+rozpoctu|za\s+\S+)\s*$/i, '')
        .trim();
      if (namePart) params.name = namePart;
    }
  }

  // Checklist intents: extract title from entities or message text
  if (
    intent === 'checklist_add' ||
    intent === 'checklist_complete' ||
    intent === 'checklist_remove' ||
    intent === 'checklist_update'
  ) {
    const titleEntity = entities.find((e: any) => e.type === 'trim' || e.entity === 'title');
    if (titleEntity) {
      params.title = titleEntity.sourceText ?? titleEntity.utteranceText ?? titleEntity.option;
    } else {
      // Strip common prefixes to get the item title
      const titlePart = message
        .replace(/^(pridej|přidej|odskrtni|odšrktni|oznac|označ|smaz|smaž|zrus|zruš)\s*/i, '')
        .replace(/\s+(do\s+checklistu|jako\s+hotov\w+|z\s+checklistu)\s*$/i, '')
        .trim();
      if (titlePart) params.title = titlePart;
    }
  }

  // Query intents: determine filter from message keywords
  if (intent === 'checklist_query') {
    const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/po\s+termin/.test(lower)) params.filter = 'overdue';
    else if (/zbyva|nesplnen/.test(lower)) params.filter = 'pending';
    else if (/hotov|splnen|dokoncen/.test(lower)) params.filter = 'completed';
    else params.filter = 'all';
  }

  if (intent === 'budget_query') {
    const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/zaplatit|nezaplacen/.test(lower)) params.filter = 'unpaid';
    else if (/zaplacen/.test(lower)) params.filter = 'paid';
    else params.filter = 'all';
  }

  if (intent === 'guest_query') {
    const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/potvrdi|prijde/.test(lower)) params.filter = 'confirmed';
    else if (/neodpovedel|ceka/.test(lower)) params.filter = 'pending';
    else if (/odmit|neprijde/.test(lower)) params.filter = 'declined';
    else params.filter = 'all';
  }

  return params;
}

/**
 * Classify user message intent.
 * NLP.js is the primary classifier (no API call, deterministic, < 50ms).
 * Falls back to Kilo Gateway (Haiku) only when NLP.js confidence < 0.5.
 */
export async function classifyIntent(
  message: string,
  conversationContext?: string[]
): Promise<IntentResult> {
  // --- Primary: NLP.js ---
  try {
    const nlp = getNlpClassifier();
    const nlpResult = await nlp.classify(message);

    // NLP.js returns intent "None" (with score 1) when no training utterance matches.
    // Treat "None" as no-match regardless of confidence score.
    const isNoneIntent = nlpResult.intent === 'None' || nlpResult.intent === 'none';

    if (!isNoneIntent && nlpResult.confidence >= 0.5) {
      console.log(
        `[Intent Classifier] NLP.js classified: ${nlpResult.intent} (${nlpResult.confidence.toFixed(3)})`
      );
      const params = extractParams(nlpResult.intent, nlpResult.entities, message);
      return {
        intent: nlpResult.intent,
        confidence: nlpResult.confidence,
        params,
      };
    }

    const reason = isNoneIntent
      ? 'no match (None intent)'
      : `low confidence (${nlpResult.confidence.toFixed(3)})`;
    console.log(`[Intent Classifier] NLP.js ${reason}, falling back to Haiku`);
  } catch (nlpError) {
    console.error('[Intent Classifier] NLP.js failed, falling back to Haiku:', nlpError);
  }

  // --- Fallback: Kilo Gateway (Haiku) ---
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
    'checklist_add_multi',
    'checklist_complete',
    'checklist_remove',
    'checklist_update',
    'budget_add',
    'budget_add_multi',
    'budget_update',
    'budget_remove',
    'budget_mark_paid',
    'guest_add',
    'guest_add_multi',
    'guest_update',
    'guest_remove',
  ];

  return actionIntents.includes(intent);
}

/**
 * Determine if intent is a query (read-only, returns data for system prompt)
 */
export function isQueryIntent(intent: string): boolean {
  const queryIntents = ['checklist_query', 'budget_query', 'guest_query', 'status_overview'];
  return queryIntents.includes(intent);
}

/**
 * Determine if intent should log demand signal
 */
export function isDemandSignal(intent: string): boolean {
  return intent === 'vendor_search' || intent === 'budget_add';
}
