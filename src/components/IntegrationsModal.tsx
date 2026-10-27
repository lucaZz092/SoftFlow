import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Github, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../lib/api';
import { Button } from './ui/Button';

interface IntegrationStatus {
  github: { configured: boolean };
}

export const IntegrationsModal: React.FC = () => {
  const { isIntegrationsOpen, setIsIntegrationsOpen, setCurrentView } = useProject();
  // undefined = loading, null = request failed
  const [status, setStatus] = useState<IntegrationStatus | null | undefined>(undefined);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isIntegrationsOpen) setIsIntegrationsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIntegrationsOpen, setIsIntegrationsOpen]);

  useEffect(() => {
    if (!isIntegrationsOpen) return;
    setStatus(undefined);
    api.get<IntegrationStatus>('/api/status').then(setStatus).catch(() => setStatus(null));
  }, [isIntegrationsOpen]);

  if (!isIntegrationsOpen) return null;

  const configured = Boolean(status?.github.configured);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsIntegrationsOpen(false)}
        className="fixed inset-0 bg-black/50"
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-label="Integrações"
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--border-subtle)]">
          <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <Github className="w-4 h-4" /> GitHub
          </h2>
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(false)}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {status === undefined ? (
            <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" /> Verificando…
            </div>
          ) : configured ? (
            <div className="flex items-start gap-2 text-[13px] text-emerald-500">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Token configurado.</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-[13px] text-amber-500">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {status === null ? 'Não foi possível verificar.' : 'Defina a variável'}{' '}
                {status !== null && <span className="font-mono">GITHUB_TOKEN</span>}
                {status !== null && ' na Vercel (token de acesso pessoal, só leitura).'}
              </span>
            </div>
          )}

          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Somente leitura: seus PRs, PRs aguardando sua revisão, issues atribuídas, repositórios e atividade recente. O
            token fica só no servidor.
          </p>

          {configured && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Github className="w-3.5 h-3.5" />}
              onClick={() => {
                setCurrentView('github');
                setIsIntegrationsOpen(false);
              }}
            >
              Abrir tela GitHub
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
