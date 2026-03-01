'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Users, MapPin, Palette, Wallet, Shield } from 'lucide-react';
import { Button } from '@/components/ui';

const CZECH_CITIES = [
  'Praha', 'Brno', 'Ostrava', 'Plzen', 'Liberec', 'Olomouc', 'Usti nad Labem',
  'Hradec Kralove', 'Ceske Budejovice', 'Pardubice', 'Zlin', 'Havirov', 'Kladno',
  'Most', 'Opava', 'Frydek-Mistek', 'Karvina', 'Jihlava', 'Karlovy Vary', 'Teplice',
  'Decin', 'Chomutov', 'Prerov', 'Jablonec nad Nisou', 'Prostejov', 'Mlada Boleslav',
  'Ceska Lipa', 'Trebic', 'Trinec', 'Tabor', 'Znojmo', 'Kolin', 'Pribram', 'Cheb',
  'Pisek', 'Trutnov', 'Kromeriz', 'Vsetin', 'Litomerice', 'Sokolov',
  'Valasske Mezirici', 'Hodonin', 'Beroun', 'Sumperk', 'Vyskov', 'Blansko',
  'Novy Jicin', 'Uherske Hradiste', 'Breclav', 'Svitavy', 'Benesov', 'Strakonice',
  'Kutna Hora', 'Chrudim', 'Nachod', 'Rakovnik', 'Louny', 'Jindrichuv Hradec',
  'Pelhrimov', 'Domazlice', 'Klatovy', 'Nymburk', 'Rokycany', 'Havlickuv Brod',
  'Rychnov nad Kneznou', 'Semily', 'Jesenik', 'Bruntal', 'Zatec',
];

const GUEST_OPTIONS = [
  { value: 'do-30', label: 'Do 30 hostu' },
  { value: '30-60', label: '30-60 hostu' },
  { value: '60-100', label: '60-100 hostu' },
  { value: '100-150', label: '100-150 hostu' },
  { value: '150+', label: '150+ hostu' },
];

const STYLE_OPTIONS = [
  { value: 'tradicni', label: 'Tradicni' },
  { value: 'boho', label: 'Boho' },
  { value: 'opulentni', label: 'Opulentni' },
  { value: 'minimalisticka', label: 'Minimalisticka' },
  { value: 'rustikalni', label: 'Rustikalni' },
];

const BUDGET_OPTIONS = [
  { value: 'do-100', label: 'Do 100 000 Kc' },
  { value: '100-200', label: '100-200 000 Kc' },
  { value: '200-350', label: '200-350 000 Kc' },
  { value: '350-500', label: '350-500 000 Kc' },
  { value: '500+', label: '500 000+ Kc' },
];

const RADIUS_OPTIONS = [10, 25, 50, 100];

const PRESET_BASE = 'w-full p-4 rounded-xl border-2 text-left transition-colors';
const PRESET_ACTIVE = 'border-[var(--color-primary)] bg-[var(--color-secondary)]';
const PRESET_INACTIVE = 'border-gray-200 hover:border-gray-300';

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);

  // GDPR
  const [gdprConsent, setGdprConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [gdprTimestamp, setGdprTimestamp] = useState('');

  // Step 1
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [dateUnknown, setDateUnknown] = useState(false);

  // Step 2
  const [guestCount, setGuestCount] = useState('');

  // Step 3
  const [location, setLocation] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);

  // Step 4
  const [weddingStyle, setWeddingStyle] = useState('');

  // Step 5
  const [budget, setBudget] = useState('');

  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');

    if (step === 0) {
      if (!gdprConsent) {
        setError('Souhlas se zpracovanim osobnich udaju je povinny');
        return;
      }
      setGdprTimestamp(new Date().toISOString());
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!partner1 || !partner2) {
        setError('Vyplnte jmena obou partneru');
        return;
      }
      if (!dateUnknown) {
        if (!weddingDate) {
          setError('Vyberte datum svatby nebo zvolte "Jeste nevime"');
          return;
        }
        const selected = new Date(weddingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          setError('Datum svatby musi byt v budoucnosti');
          return;
        }
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!guestCount) {
        setError('Vyberte pocet hostu');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!location) {
        setError('Zadejte mesto nebo region');
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!weddingStyle) {
        setError('Vyberte styl svatby');
        return;
      }
      setStep(5);
      return;
    }
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const finish = () => {
    const params = new URLSearchParams({
      p1: partner1,
      p2: partner2,
      date: dateUnknown ? '' : weddingDate,
      guests: guestCount,
      location: location,
      radius: radiusKm.toString(),
      style: weddingStyle,
      budget: budget,
      gdpr: gdprTimestamp,
      marketing: marketingConsent ? '1' : '0',
    });
    router.push(`/register?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif text-[var(--color-primary)]">Svoji</h1>
        </div>

        {/* Progress bar -- visible only from step 1 */}
        {step >= 1 && (
          <div className="w-full h-0.5 bg-gray-100 mb-8">
            <motion.div
              className="h-full bg-[var(--color-primary)]"
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="bg-white p-8 rounded-lg">

              {/* Error */}
              {error && (
                <div className="border-l-2 border-red-400 bg-red-50/70 text-red-700 px-4 py-3 rounded-r-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Step 0: GDPR */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                    <h2 className="text-xl font-medium">Ochrana vasich udaju</h2>
                    <p className="text-sm text-[var(--color-text-light)] mt-1">
                      Pred zacatkem potrebujeme vas souhlas
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gdprConsent}
                        onChange={(e) => setGdprConsent(e.target.checked)}
                        className="mt-0.5 accent-[var(--color-primary)] w-4 h-4 flex-shrink-0"
                      />
                      <span className="text-sm text-[var(--color-text)]">
                        Souhlasim se{' '}
                        <a href="/privacy" className="underline text-[var(--color-primary)]">
                          zpracovanim osobnich udaju
                        </a>{' '}
                        (povinne)
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="mt-0.5 accent-[var(--color-primary)] w-4 h-4 flex-shrink-0"
                      />
                      <span className="text-sm text-[var(--color-text)]">
                        Souhlasim se zasilanim novinek a tipu (volitelne)
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={nextStep}
                      className="w-full"
                    >
                      Pokracovat
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 1: Names + Date */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                    <h2 className="text-xl font-medium text-center">Jak se jmenujete?</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Partner 1</label>
                    <input
                      type="text"
                      value={partner1}
                      onChange={(e) => setPartner1(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder="Jmeno"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Partner 2</label>
                    <input
                      type="text"
                      value={partner2}
                      onChange={(e) => setPartner2(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder="Jmeno"
                    />
                  </div>

                  {!dateUnknown && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Datum svatby</label>
                      <input
                        type="date"
                        value={weddingDate}
                        onChange={(e) => setWeddingDate(e.target.value)}
                        min={today}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDateUnknown(!dateUnknown);
                      if (!dateUnknown) setWeddingDate('');
                    }}
                    className={`w-full p-3 rounded-xl border-2 text-sm transition-colors ${
                      dateUnknown ? PRESET_ACTIVE : PRESET_INACTIVE
                    }`}
                  >
                    Jeste nevime
                  </button>

                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                      Zpet
                    </Button>
                    <Button type="button" variant="primary" onClick={nextStep} className="flex-1">
                      Pokracovat
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Guest count */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Users className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                    <h2 className="text-xl font-medium text-center">Kolik cekate hostu?</h2>
                  </div>

                  <div className="space-y-3">
                    {GUEST_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setGuestCount(opt.value)}
                        className={`${PRESET_BASE} ${guestCount === opt.value ? PRESET_ACTIVE : PRESET_INACTIVE}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                      Zpet
                    </Button>
                    <Button type="button" variant="primary" onClick={nextStep} className="flex-1">
                      Pokracovat
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Location + Radius */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                    <h2 className="text-xl font-medium text-center">Kde planujete svatbu?</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mesto nebo region</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      list="czech-cities"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder="Napr. Praha"
                    />
                    <datalist id="czech-cities">
                      {CZECH_CITIES.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Okruh hledani</p>
                    <div className="grid grid-cols-4 gap-2">
                      {RADIUS_OPTIONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRadiusKm(r)}
                          className={`p-3 rounded-xl border-2 text-sm transition-colors ${
                            radiusKm === r ? PRESET_ACTIVE : PRESET_INACTIVE
                          }`}
                        >
                          {r} km
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                      Zpet
                    </Button>
                    <Button type="button" variant="primary" onClick={nextStep} className="flex-1">
                      Pokracovat
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Wedding style */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Palette className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                    <h2 className="text-xl font-medium text-center">Jaky styl svatby vas oslovi?</h2>
                  </div>

                  <div className="space-y-3">
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWeddingStyle(opt.value)}
                        className={`${PRESET_BASE} ${weddingStyle === opt.value ? PRESET_ACTIVE : PRESET_INACTIVE}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                      Zpet
                    </Button>
                    <Button type="button" variant="primary" onClick={nextStep} className="flex-1">
                      Pokracovat
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Budget */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                    <h2 className="text-xl font-medium text-center">Jaky mate rozpocet?</h2>
                    <p className="text-sm text-[var(--color-text-light)] mt-1">
                      Volitelne -- muzete preskocit
                    </p>
                  </div>

                  <div className="space-y-3">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBudget(budget === opt.value ? '' : opt.value)}
                        className={`${PRESET_BASE} ${budget === opt.value ? PRESET_ACTIVE : PRESET_INACTIVE}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                      Zpet
                    </Button>
                    {!budget && (
                      <Button type="button" variant="secondary" onClick={finish} className="flex-1">
                        Preskocit
                      </Button>
                    )}
                    <Button type="button" variant="primary" onClick={finish} className="flex-1">
                      Dokoncit
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
