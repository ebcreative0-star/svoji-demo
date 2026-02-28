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

    // Demo mode bypass
    if (isDemoMode()) {
      router.push('/checklist');
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-secondary)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif">Svoji</Link>
          <p className="text-[var(--color-text-light)] mt-2">
            Přihlaste se ke svému účtu
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="vas@email.cz"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
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

          <p className="text-center text-sm text-[var(--color-text-light)]">
            Nemáte účet?{' '}
            <Link href="/register" className="text-[var(--color-primary)] hover:underline">
              Zaregistrujte se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
