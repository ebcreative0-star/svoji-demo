import { Metadata } from 'next';
import { SaasFooter } from '@/components/ui/SaasFooter';

export const metadata: Metadata = {
  title: 'Ochrana soukromí | Svoji.cz',
};

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-[var(--color-background)] py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-4xl text-[var(--color-text)] mb-8">
            Ochrana soukromí
          </h1>
          <p className="text-sm text-[var(--color-text-light)] mb-10">
            Poslední aktualizace: 1. března 2026
          </p>

          <div className="space-y-8 text-[var(--color-text)] leading-relaxed">
            <section>
              <h2 className="font-heading text-2xl mb-3">1. Správce údajů</h2>
              <p>
                Správcem osobních údajů je Svoji.cz (dále jen &quot;Správce&quot;). V
                případě dotazů ohledně zpracování osobních údajů nás kontaktujte na{' '}
                <a
                  href="mailto:info@svoji.cz"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  info@svoji.cz
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">2. Jaké údaje zpracováváme</h2>
              <p>V rámci poskytování Služby zpracováváme následující osobní údaje:</p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Emailová adresa (pro registraci a komunikaci)</li>
                <li>Jména partnerů (pro personalizaci svatebního plánu)</li>
                <li>Datum a místo svatby (pro plánování)</li>
                <li>Seznam hostů a jejich kontaktní údaje (vkládané uživatelem)</li>
                <li>Rozpočtové údaje (pro správu financí)</li>
                <li>Komunikace s AI asistentem (pro poskytování poradenství)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">3. Účel zpracování</h2>
              <p>Osobní údaje zpracováváme za účelem:</p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Poskytování a zlepšování Služby</li>
                <li>Správy uživatelského účtu</li>
                <li>Komunikace s uživatelem</li>
                <li>Personalizace obsahu a doporučení AI asistenta</li>
                <li>Plnění zákonných povinností</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">4. Právní základ</h2>
              <p>
                Zpracování osobních údajů je založeno na plnění smlouvy (poskytování
                Služby), oprávněném zájmu Správce (zlepšování Služby) a souhlasu
                uživatele (marketingová komunikace). U marketingové komunikace máte právo
                souhlas kdykoli odvolat.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">5. Doba uchovávání</h2>
              <p>
                Osobní údaje uchováváme po dobu trvání uživatelského účtu a dále po dobu
                nezbytnou pro plnění zákonných povinností (typicky 3 roky po zrušení
                účtu). Po uplynutí této doby jsou údaje bezpečně smazány.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">6. Vaše práva</h2>
              <p>Podle nařízení GDPR máte následující práva:</p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>
                  <strong>Právo na přístup</strong> -- k osobním údajům, které o vás
                  zpracováváme
                </li>
                <li>
                  <strong>Právo na opravu</strong> -- nepřesných nebo neúplných údajů
                </li>
                <li>
                  <strong>Právo na výmaz</strong> -- osobních údajů (&quot;právo být
                  zapomenut&quot;)
                </li>
                <li>
                  <strong>Právo na přenositelnost</strong> -- údajů ve strojově čitelném
                  formátu
                </li>
                <li>
                  <strong>Právo vznést námitku</strong> -- proti zpracování na základě
                  oprávněného zájmu
                </li>
                <li>
                  <strong>Právo podat stížnost</strong> -- u Úřadu pro ochranu osobních
                  údajů (uoou.cz)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">7. Cookies</h2>
              <p>
                Služba používá nezbytné cookies pro zajištění funkčnosti aplikace
                (přihlášení, nastavení session). Analytické cookies používáme pouze se
                souhlasem uživatele. Podrobnosti o cookies a jejich správě najdete v
                nastavení svého prohlížeče.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl mb-3">8. Kontakt</h2>
              <p>
                V případě dotazů ohledně ochrany osobních údajů nás kontaktujte na{' '}
                <a
                  href="mailto:info@svoji.cz"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  info@svoji.cz
                </a>{' '}
                nebo prostřednictvím{' '}
                <a href="/contact" className="text-[var(--color-primary)] hover:underline">
                  kontaktního formuláře
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <SaasFooter />
    </>
  );
}
