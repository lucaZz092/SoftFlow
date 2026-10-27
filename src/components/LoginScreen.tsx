import React, { useState } from 'react';
import { Github, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Button } from './ui/Button';

export const LoginScreen: React.FC = () => {
  const { signInWithGithub } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGithub();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-primary)] px-4">
      <div className="w-full max-w-xs text-center space-y-6">
        <div className="space-y-3">
          <span className="mx-auto w-9 h-9 rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] flex items-center justify-center text-sm font-semibold">
            S
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Entrar no SoftFlow</h1>
          <p className="text-[13px] text-[var(--text-muted)]">Use sua conta do GitHub para acessar o workspace.</p>
        </div>

        {isSupabaseConfigured ? (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleSignIn}
            isLoading={isLoading}
            leftIcon={<Github className="w-4 h-4" />}
          >
            Continuar com GitHub
          </Button>
        ) : (
          <p className="text-[13px] text-rose-500">
            Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
          </p>
        )}

        {error && <p className="text-[13px] text-rose-500">{error}</p>}
      </div>
    </div>
  );
};

/** Shown when someone signs in with a GitHub account whose e-mail isn't on the allowlist. */
export const AccessDenied: React.FC = () => {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-primary)] px-4">
      <div className="w-full max-w-xs text-center space-y-4">
        <h1 className="text-lg font-semibold tracking-tight">Acesso não autorizado</h1>
        <p className="text-[13px] text-[var(--text-muted)]">
          A conta {user?.email || user?.name} não tem acesso a este workspace.
        </p>
        <Button variant="secondary" size="md" className="w-full" onClick={() => void signOut()} leftIcon={<LogOut className="w-4 h-4" />}>
          Sair
        </Button>
      </div>
    </div>
  );
};
