import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createChatCompletion } from '@/lib/kilo';
import { classifyIntent, isActionIntent, isDemandSignal } from '@/lib/ai/intent-classifier';
import { executeAction } from '@/lib/ai/action-executor';
import { logDemandSignal, extractDemandSignal } from '@/lib/ai/demand-logger';
import { checkAndIncrementChatLimit } from '@/lib/rate-limit';

// Check API key at module load
if (!process.env.KILO_API_KEY) {
  console.warn('KILO_API_KEY not set - chat will not work');
}

interface ChatContext {
  partner1: string;
  partner2: string;
  weddingDate: string | null;
  guestCountRange: string | null;
  location: string | null;
  searchRadiusKm: number | null;
  weddingStyle: string | null;
  budget: number | null;
  // Backward compat -- may still be sent by older clients
  weddingSize?: string;
}

function buildSystemPrompt(context: ChatContext): string {
  const dateStr = context.weddingDate
    ? new Date(context.weddingDate).toLocaleDateString('cs-CZ')
    : 'datum zatim neni stanoveno';

  const daysUntilWedding = context.weddingDate
    ? Math.ceil((new Date(context.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const guestLabel = context.guestCountRange
    ? context.guestCountRange + ' hostu'
    : (context.weddingSize === 'small' ? 'do 30 hostu'
      : context.weddingSize === 'medium' ? '30-80 hostu'
      : context.weddingSize === 'large' ? '80+ hostu'
      : 'neuvedeno');

  const styleLabels: Record<string, string> = {
    'tradicni': 'tradicni ceska',
    'boho': 'boho / prirodni',
    'opulentni': 'opulentni / luxusni',
    'minimalisticka': 'minimalisticka',
    'rustikalni': 'rustikalni / venkovska',
  };
  const styleLabel = context.weddingStyle
    ? styleLabels[context.weddingStyle] ?? context.weddingStyle
    : null;

  const locationLine = context.location
    ? `- Oblast: ${context.location}${context.searchRadiusKm ? ` (okruh ${context.searchRadiusKm} km)` : ''}`
    : '';
  const styleLine = styleLabel ? `- Styl: ${styleLabel}` : '';

  return `Jsi Svoji, pratelsky AI asistent pro planovani svateb v Ceske republice.

TVOJE ROLE:
- Pomahas parum naplanovat svatbu od zacatku do konce
- Odpovidas na otazky o svatebnich tradicich, etiketu, dodavatelich
- Doporucujes na zaklade rozpoctu a preferenci
- Pripominas dulezite ukoly
- Jsi pratelsky, ale profesionalni
- Pri rozhodovani nabizej konkretni volby (napr. "A nebo B?"), ne jen obecne rady

KONTEXT PARU:
- Jmena: ${context.partner1} a ${context.partner2}
- Datum svatby: ${dateStr}${daysUntilWedding ? ` (za ${daysUntilWedding} dni, ${Math.ceil(daysUntilWedding / 30)} mesicu)` : ''}
- Pocet hostu: ${guestLabel}
${locationLine}
${styleLine}
${context.budget ? `- Rozpocet: ${context.budget.toLocaleString('cs-CZ')} Kc` : '- Rozpocet: neuvedeno'}

PRVNI ZPRAVA (pouzij pri prvnim kontaktu):
Zacni osobne -- pozdrav ${context.partner1} a ${context.partner2} jmenem${styleLabel ? `, zmin jejich styl (${styleLabel})` : ''}${context.location ? ` a oblast (${context.location})` : ''}, a navrhni prvni konkretni krok (napr. "Zacneme vyberem mista?").

PRAVIDLA:
- Pis cesky, pratelsky ale profesionalne
- Davej konkretni, prakticke rady
- Pri dotazech na ceny uvadej ceske ceny a rozpeti
- Nezapomen na ceske tradice a zvyklosti
- Pokud nevis, priznej to a navrhni kde najit informace
- Bud strucny ale informativni
- Nepouzivej emoji prehrane
${context.location && context.searchRadiusKm ? `- Pri doporucenych dodavatelich hledej v okruhu ${context.searchRadiusKm} km od ${context.location}` : ''}

AKCE A DATA:
- Kdyz uzivatel chce pridat/upravit/smazat polozku (checklist, rozpocet, host), system automaticky provede akci
- Tvuj ukol je potvrdit akci a rict co bylo udelano
- Nezminuj technicky proces, jen vysledek ("Pridal jsem...", "Oznacil jsem...", "Aktualizoval jsem...")
- Pokud akce selhala, omluvni se a navrhni rucni postup`;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API is configured
    if (!process.env.KILO_API_KEY) {
      return NextResponse.json(
        { error: 'Chat neni nakonfigurovany. Kontaktujte podporu.' },
        { status: 503 }
      );
    }

    const { message, coupleId, context } = await request.json();

    if (!message || !coupleId || !context) {
      return NextResponse.json(
        { error: 'Chybi povinne parametry' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // SECURITY: Verify that the authenticated user owns this coupleId
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Neautorizovany pristup' },
        { status: 401 }
      );
    }

    // Verify ownership via RLS - if user can read this couple row, they own it
    const { data: coupleRow } = await supabase
      .from('couples')
      .select('id')
      .eq('id', coupleId)
      .single();

    if (!coupleRow) {
      return NextResponse.json(
        { error: 'Nemate opravneni k tomuto chatu' },
        { status: 403 }
      );
    }

    // RATE LIMITING: Check and increment rate limit BEFORE processing
    const rateLimit = await checkAndIncrementChatLimit(supabase, coupleId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Dnesni limit zprav (50) byl vycerpan. Zkus to zitra!',
          resetAt: rateLimit.resetAt,
          count: rateLimit.count,
          limit: rateLimit.limit
        },
        { status: 429 }
      );
    }

    // Nacist historii chatu (poslednich 10 zprav pro kontext)
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Sestavit zpravy pro Claude
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];

    // Pridat historii (v opacnem poradi, aby byla chronologicka)
    if (history) {
      history.reverse().forEach((msg) => {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      });
    }

    // Pridat aktualni zpravu
    messages.push({ role: 'user', content: message });

    // STEP 1: Classify intent
    const conversationContext = history?.map((msg) => `${msg.role}: ${msg.content}`) || [];
    const intentResult = await classifyIntent(message, conversationContext);

    console.log('Intent classification:', intentResult);

    // STEP 2: Execute action if needed (BEFORE AI response)
    let actionResult = null;
    if (isActionIntent(intentResult.intent) && intentResult.confidence > 0.7) {
      actionResult = await executeAction(
        supabase,
        coupleId,
        intentResult.intent,
        intentResult.params
      );

      console.log('Action execution:', actionResult);
    }

    // STEP 3: Build system prompt with action context
    let systemPrompt = buildSystemPrompt(context);

    if (actionResult) {
      systemPrompt += `\n\nAKCE PROVEDENA:
- Intent: ${intentResult.intent}
- Výsledek: ${actionResult.success ? 'úspěch' : 'selhání'}
- Zpráva: ${actionResult.message}

DŮLEŽITÉ: Potvrď tuto akci ve své odpovědi uživateli. ${actionResult.success ? 'Řekni co jsi přidal/změnil/smazal.' : 'Omluvení a vysvětli proč to nešlo.'}`;
    } else if (isActionIntent(intentResult.intent)) {
      // Intent looked like an action but confidence was too low or it wasn't executed
      systemPrompt += `\n\nDULEZITE: Uzivatel mozna chtel provest akci, ale system si nebyl jisty. NEPOTVRZUJ zadnou akci. Zeptej se uzivatele pro upresneni.`;
    } else {
      // No action intent detected at all
      systemPrompt += `\n\nZADNA AKCE NEBYLA PROVEDENA - nepotvrzuj zadnou akci, nedelej jako bys neco pridal/zmenil/smazal v checklistu, rozpoctu nebo seznamu hostu.`;
    }

    // STEP 4: Volat Kilo Gateway API
    let assistantMessage = await createChatCompletion(
      messages,
      systemPrompt,
      1024
    );

    // STEP 4.5: Add rate limit warning if threshold reached
    if (rateLimit.warning) {
      const remaining = rateLimit.remaining;
      assistantMessage += `\n\n⚠️ Pozor: Zbyva ti uz jen ${remaining} ${remaining === 1 ? 'zprava' : remaining < 5 ? 'zpravy' : 'zprav'} dnes. Limit se obnovi o pulnoci.`;
    }

    // Ulozit zpravy do databaze
    await supabase.from('chat_messages').insert([
      { couple_id: coupleId, role: 'user', content: message },
      { couple_id: coupleId, role: 'assistant', content: assistantMessage },
    ]);

    // STEP 5: Log demand signal (async, fire-and-forget)
    if (isDemandSignal(intentResult.intent) && intentResult.confidence > 0.7) {
      const demandSignal = extractDemandSignal(intentResult.params);
      if (demandSignal) {
        // Fire-and-forget - don't await
        logDemandSignal(supabase, coupleId, demandSignal, message).catch((error) => {
          console.error('Demand signal logging failed:', error);
        });
      }
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Interni chyba serveru' },
      { status: 500 }
    );
  }
}
