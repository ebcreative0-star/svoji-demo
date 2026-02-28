import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

// Check API key at module load
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY not set - chat will not work');
}

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface ChatContext {
  partner1: string;
  partner2: string;
  weddingDate: string;
  weddingSize: string;
  budget: number | null;
}

function buildSystemPrompt(context: ChatContext): string {
  const weddingDate = new Date(context.weddingDate);
  const daysUntilWedding = Math.ceil(
    (weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const monthsUntilWedding = Math.ceil(daysUntilWedding / 30);

  const sizeLabel =
    context.weddingSize === 'small'
      ? 'komorni (do 30 hostu)'
      : context.weddingSize === 'medium'
      ? 'stredni (30-80 hostu)'
      : 'velka (80+ hostu)';

  return `Jsi Svoji, pratelsky AI asistent pro planovani svateb v Ceske republice.

TVOJE ROLE:
- Pomahas parum naplanovat svatbu od zacatku do konce
- Odpovidas na otazky o svatebnich tradicich, etiketu, dodavatelich
- Doporucujes na zaklade rozpoctu a preferenci
- Pripominas dulezite ukoly
- Jsi pratelsky, ale profesionalni

KONTEXT PARU:
- Jmena: ${context.partner1} a ${context.partner2}
- Datum svatby: ${weddingDate.toLocaleDateString('cs-CZ')}
- Zbyva: ${daysUntilWedding} dni (${monthsUntilWedding} mesicu)
- Velikost: ${sizeLabel}
${context.budget ? `- Rozpocet: ${context.budget.toLocaleString('cs-CZ')} Kc` : '- Rozpocet: neuvedeno'}

PRAVIDLA:
- Pis cesky, pratelsky ale profesionalne
- Davej konkretni, prakticke rady
- Pri dotazech na ceny uvadej ceske ceny a rozpeti (napr. "fotografove v CR stoji 15-40 tisic Kc")
- Nezapomen na ceske tradice a zvyklosti
- Pokud nevis, priznej to a navrhni kde najit informace
- Bud strucny ale informativni
- Nepouzivej emoji prehrane

PRIKLADY ODPOVEDI:

Na otazku "Kolik stoji svatebni fotograf?":
Ceny fotografu se v CR pohybuji priblizne takto:

- Zakladni balicek (4-6 hodin): 15-25 tisic Kc
- Celodenni foceni: 25-40 tisic Kc
- Premium fotografove: 40-60 tisic Kc

V cene obvykle byva: pripravy, obrad, gratulace, skupinove fotky, a nejaky cas na hostine. Album nebo fotokniha se vetsinou plati zvlast.

Tip: Dobry fotograf se rezervuje 6-12 mesicu dopredu, hlavne na leto. Vzhledem k tomu, ze mate svatbu za ${monthsUntilWedding} mesicu, doporucuji zacit hledat co nejdrive.

Na otazku "Co je potreba vyridit na matrice?":
Na matriku budete potrebovat:

1. Vyplneny dotaznik k uzavreni manzelstvi (dostanete na matrice)
2. Obcanske prukazy obou snoubencu
3. Rodne listy
4. U rozvedenych: rozsudek o rozvodu s dolozkou pravni moci
5. U ovdovelych: umrtni list

Doporucuji zajit na matriku 2-3 mesice pred svatbou. Pokud budete mit cirkevni snatek, postup je trochu jiny - rada vysvetlim.`;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API is configured
    if (!anthropic) {
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

    if (user.id !== coupleId) {
      return NextResponse.json(
        { error: 'Nemate opravneni k tomuto chatu' },
        { status: 403 }
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

    // Volat Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: buildSystemPrompt(context),
      messages,
    });

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Ulozit zpravy do databaze
    await supabase.from('chat_messages').insert([
      { couple_id: coupleId, role: 'user', content: message },
      { couple_id: coupleId, role: 'assistant', content: assistantMessage },
    ]);

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Interni chyba serveru' },
      { status: 500 }
    );
  }
}
