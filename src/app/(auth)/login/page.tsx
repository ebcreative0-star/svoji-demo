'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { Input } from '@/components/ui';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError('Přihlášení přes Google selhalo');
      setGoogleLoading(false);
    }
    // On success, browser redirects -- no need to reset loading
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Nesprávný email nebo heslo');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Zadejte email pro obnovení hesla');
      return;
    }
    setError('');
    setSuccessMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });
    if (error) {
      setError('Nepodařilo se odeslat email pro obnovení hesla');
    } else {
      setSuccessMessage('Odkaz pro obnovení hesla byl odeslán. Zkontrolujte svou schránku.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'radial-gradient(ellipse at top, var(--color-secondary) 0%, var(--color-background) 70%)',
      }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className="shadow-lg">
          <Card.Body className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <Link href="/" className="text-3xl font-serif text-[var(--color-primary)]">
                Svoji
              </Link>
              <p className="text-[var(--color-text-light)] mt-2 text-sm">
                Přihlaste se ke svému účtu
              </p>
            </div>

            {error && (
              <div className="border-l-2 border-red-400 bg-red-50/70 text-red-700 px-4 py-3 rounded-r-lg text-sm mb-4">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="border-l-2 border-green-400 bg-green-50/70 text-green-700 px-4 py-3 rounded-r-lg text-sm mb-4">
                {successMessage}
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              isLoading={googleLoading}
              leadingIcon={!googleLoading ? <GoogleIcon /> : undefined}
              onClick={handleGoogleSignIn}
            >
              Pokračovat přes Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[var(--color-text-light)]">nebo</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.cz"
                required
              />

              <Input
                label="Heslo"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Zapomenuté heslo?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full mt-2"
              >
                Přihlásit se
              </Button>
            </form>

            <p className="text-center text-sm text-[var(--color-text-light)] mt-6">
              Nemáte účet?{' '}
              <Link
                href="/register"
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                Zaregistrujte se
              </Link>
            </p>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
}
