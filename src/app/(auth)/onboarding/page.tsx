'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Calendar, Users, Wallet } from 'lucide-react';

type WeddingSize = 'small' | 'medium' | 'large';

const SIZE_OPTIONS: { value: WeddingSize; label: string; description: string }[] = [
  { value: 'small', label: 'Komorní', description: 'Do 30 hostů' },
  { value: 'medium', label: 'Střední', description: '30-80 hostů' },
  { value: 'large', label: 'Velká', description: '80+ hostů' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingSize, setWeddingSize] = useState<WeddingSize | ''>('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!partner1 || !partner2 || !weddingDate || !weddingSize) {
      setError('Vyplnte prosim vsechna povinna pole');
      return;
    }

    // Server-side date validation
    const selectedDate = new Date(weddingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Datum svatby musi byt v budoucnosti');
      return;
    }

    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Nejste přihlášeni');
      setLoading(false);
      return;
    }

    // Uložit data páru
    const { error: insertError } = await supabase
      .from('couples')
      .upsert({
        id: user.id,
        partner1_name: partner1,
        partner2_name: partner2,
        wedding_date: weddingDate,
        wedding_size: weddingSize,
        budget_total: budget ? parseFloat(budget) : null,
        onboarding_completed: true,
      });

    if (insertError) {
      setError('Nepodařilo se uložit data: ' + insertError.message);
      setLoading(false);
      return;
    }

    // Vygenerovat checklist - voláme API
    const { error: checklistError } = await supabase.functions.invoke('generate-checklist', {
      body: {
        couple_id: user.id,
        wedding_date: weddingDate,
        wedding_size: weddingSize,
      },
    });

    // Pokud edge function neexistuje, checklist vygenerujeme na klientu
    if (checklistError) {
      console.log('Edge function not available, generating on client');
      // Checklist se vygeneruje při prvním načtení checklistu
    }

    router.push('/checklist');
    router.refresh();
  };

  const nextStep = () => {
    if (step === 1 && (!partner1 || !partner2)) {
      setError('Vyplňte jména obou partnerů');
      return;
    }
    if (step === 2) {
      if (!weddingDate) {
        setError('Vyberte datum svatby');
        return;
      }
      const selectedDate = new Date(weddingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError('Datum svatby musi byt v budoucnosti');
        return;
      }
    }
    if (step === 3 && !weddingSize) {
      setError('Vyberte velikost svatby');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-secondary)] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2">Vítejte ve Svoji</h1>
          <p className="text-[var(--color-text-light)]">
            Řekněte nám o vaší svatbě
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s <= step ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Names */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-medium">Jak se jmenujete?</h2>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Partner 1
                </label>
                <input
                  type="text"
                  value={partner1}
                  onChange={(e) => setPartner1(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Jméno"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Partner 2
                </label>
                <input
                  type="text"
                  value={partner2}
                  onChange={(e) => setPartner2(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Jméno"
                />
              </div>
            </div>
          )}

          {/* Step 2: Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                <h2 className="text-xl font-medium">Kdy máte svatbu?</h2>
                <p className="text-sm text-[var(--color-text-light)] mt-1">
                  Podle data vytvoříme váš personalizovaný checklist
                </p>
              </div>

              <div>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center text-lg"
                />
              </div>
            </div>
          )}

          {/* Step 3: Size */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Users className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                <h2 className="text-xl font-medium">Jak velká bude svatba?</h2>
              </div>

              <div className="space-y-3">
                {SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setWeddingSize(option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      weddingSize === option.value
                        ? 'border-[var(--color-primary)] bg-[var(--color-secondary)]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-[var(--color-text-light)]">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
                <h2 className="text-xl font-medium">Jaký máte rozpočet?</h2>
                <p className="text-sm text-[var(--color-text-light)] mt-1">
                  Volitelné - pomůže s doporučeními
                </p>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center text-lg"
                  placeholder="150000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]">
                  Kč
                </span>
              </div>

              <p className="text-center text-sm text-[var(--color-text-light)]">
                Průměrná svatba v ČR stojí 150-300 tisíc Kč
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 btn-outline"
              >
                Zpět
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 btn-primary"
              >
                Pokračovat
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vytvářím plán...
                  </>
                ) : (
                  'Začít plánovat'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
