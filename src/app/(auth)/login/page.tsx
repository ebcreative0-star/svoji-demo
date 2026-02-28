'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { isDemoMode } from '@/lib/demo-data';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo credentials: demo / demo
    if (email === 'demo' && password === 'demo') {
      window.location.href = '/checklist';
      return;
    }

    // Demo mode bypass
    if (isDemoMode()) {
      window.location.href = '/checklist';
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Nesprávný email nebo heslo');
      setLoading(false);
      return;
    }

    router.push('/checklist');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-serif text-[var(--color-primary)]">Svoji</Link>
          <p className="text-[var(--color-text-light)] mt-3 text-sm">
            Přihlaste se ke svému účtu
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-secondary)]"
              placeholder="vas@email.cz nebo demo"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Heslo
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-secondary)]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary !py-4 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Přihlašuji...
              </>
            ) : (
              'Přihlásit se'
            )}
          </button>

          <p className="text-center text-sm text-[var(--color-text-light)] mt-6">
            Nemáte účet?{' '}
            <Link href="/register" className="text-[var(--color-primary)] hover:underline font-medium">
              Zaregistrujte se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
