import { Metadata } from 'next';
import { SaasFooter } from '@/components/ui/SaasFooter';

export const metadata: Metadata = {
  title: 'Obchodní podmínky | Svoji.cz',
};

export default function TosPage() {
  return (
    <>
      <main className="min-h-screen bg-[var(--color-background)] py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-4xl text-[var(--color-text)] mb-8">
            Obchodní podmínky
          </h1>
          <p className="text-sm text-[var(--color-text-light)] mb-10">
            Poslední aktualizace: 1. března 2026
          </p>

          <div className="space-y-8 text-[var(--color-text)] leading-relaxed">
            <section>
              <h2 className="font-heading text-2xl mb-3">1. Úvodní ustanovení</h2>
              <p>
                Tyto obchodní podmínky upravují práva a povinnosti uživatelů webové
                aplikace Svoji.cz (dále jen &quot;Služba&quot;), kterou provozuje Svoji.cz
                (dále jen &quot;Provozovatel&quot;). Používáním Služby souhlasíte s těmito
                podmínkami.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">2. Registrace a účet</h2>
              <p>
                Pro využívání Služby je nutná registrace. Uživatel je povinen uvést
                pravdivé údaje a udržovat je aktuální. Každý uživatel odpovídá za
                zabezpečení svého účtu a hesla. Provozovatel nenese odpovědnost za
                neoprávněný přístup k účtu způsobený nedostatečným zabezpečením ze
                strany uživatele.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">3. Podmínky užívání</h2>
              <p>
                Služba je určena pro plánování svatebních událostí. Uživatel se zavazuje
                používat Službu v souladu s platnými právními předpisy České republiky a
                dobrými mravy. Je zakázáno:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Zneužívat Službu k nelegálním účelům</li>
                <li>Šířit nevyžádaná sdělení prostřednictvím Služby</li>
                <li>Pokoušet se o neoprávněný přístup k systému</li>
                <li>Zasahovat do funkčnosti Služby</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">4. Odpovědnost</h2>
              <p>
                Provozovatel poskytuje Službu &quot;tak jak je&quot; bez záruky dostupnosti
                nebo bezchybnosti. Provozovatel nenese odpovědnost za škody vzniklé
                používáním Služby, výpadky dostupnosti nebo ztrátu dat. AI asistent
                poskytuje pouze orientační doporučení a nenahrazuje odborné poradenství.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">5. Ochrana osobních údajů</h2>
              <p>
                Zpracování osobních údajů se řídí naší{' '}
                <a href="/privacy" className="text-[var(--color-primary)] hover:underline">
                  Zásadami ochrany soukromí
                </a>
                , které jsou nedílnou součástí těchto podmínek.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">6. Změny podmínek</h2>
              <p>
                Provozovatel si vyhrazuje právo tyto podmínky kdykoli změnit. O
                podstatných změnách budou uživatelé informováni prostřednictvím emailu
                nebo oznámení v aplikaci. Pokračováním v používání Služby po změně
                podmínek vyjadřujete souhlas s novým zněním.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">7. Závěrečná ustanovení</h2>
              <p>
                Tyto podmínky se řídí právním řádem České republiky. Případné spory
                budou řešeny příslušnými soudy České republiky. Pokud je některé
                ustanovení těchto podmínek shledáno neplatným, ostatní ustanovení
                zůstávají v platnosti.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SaasFooter />
    </>
  );
}
