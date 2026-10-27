import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  GitBranch,
  Bot,
  Zap,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Button } from './ui/Button';

export const IntegrationsModal: React.FC = () => {
  const {
    isIntegrationsOpen,
    setIsIntegrationsOpen,
    simulateGitHubEvent,
    githubToken,
    setGithubToken,
    isGithubConnected,
    testGithubConnection,
    githubUser,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'github' | 'claude' | 'codex'>('github');
  const [githubRepo, setGithubRepo] = useState('preventsenior/soft-solutions-core');
  const [tempToken, setTempToken] = useState(githubToken);
  const [isTesting, setIsTesting] = useState(false);
  const [claudeModel, setClaudeModel] = useState('claude-3-5-sonnet');
  const [codexFramework, setCodexFramework] = useState('vitest');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isIntegrationsOpen) {
        setIsIntegrationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIntegrationsOpen, setIsIntegrationsOpen]);

  if (!isIntegrationsOpen) return null;

  const handleTestToken = async () => {
    setIsTesting(true);
    await testGithubConnection(tempToken);
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsIntegrationsOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden flex flex-col z-10"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                Configurações de Integração
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                GitHub (PAT Autenticado), Claude 3.5 Sonnet &amp; Codex Engine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/50 px-4 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'github'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-500" />
            <span>GitHub (Token PAT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claude')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'claude'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-500" />
            <span>Claude (Refinamento)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('codex')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'codex'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Codex (Testes)</span>
          </button>
        </div>

        {/* Tab Bodies */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: GitHub */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div
                className={`flex items-center justify-between p-3.5 rounded-xl border ${
                  isGithubConnected
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isGithubConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {isGithubConnected ? 'Autenticado via GitHub PAT' : 'Token não validado'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {isGithubConnected
                        ? `Usuário autenticado: ${githubUser}`
                        : 'Insira o token para sincronizar branches e PRs'}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    isGithubConnected
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isGithubConnected ? 'CONECTADO' : 'PENDENTE'}
                </span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[var(--text-primary)] font-semibold mb-1.5 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>Token de Acesso Pessoal (PAT):</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={tempToken}
                      onChange={(e) => setTempToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="flex-1 bg-[var(--bg-canvas)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] outline-none font-mono text-xs focus:border-[var(--accent-primary)]"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleTestToken}
                      isLoading={isTesting}
                    >
                      Testar &amp; Salvar
                    </Button>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] mt-1.5 block">
                    Permissões requeridas: `repo` (leitura/escrita de branches, commits e pull requests).
                  </span>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-medium mb-1">
                    Repositório GitHub Alvo:
                  </label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] outline-none font-mono text-xs focus:border-[var(--accent-primary)]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2.5">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Testar Disparo de Eventos:</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        simulateGitHubEvent('PR_MERGED');
                        setIsIntegrationsOpen(false);
                      }}
                    >
                      Simular PR Merged
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        simulateGitHubEvent('PR_OPENED');
                        setIsIntegrationsOpen(false);
                      }}
                    >
                      Simular Novo PR
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Claude */}
          {activeTab === 'claude' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Claude 3.5 Sonnet Configurado</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Geração de critérios de aceite e refinamento de histórias
                  </div>
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase bg-indigo-500/20 px-2 py-0.5 rounded-full">
                  PRONTO
                </span>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1.5">
                  Modelo de Linguagem:
                </label>
                <select
                  value={claudeModel}
                  onChange={(e) => setClaudeModel(e.target.value)}
                  className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-3 py-2 rounded-lg border border-[var(--border-subtle)] outline-none text-xs cursor-pointer focus:border-[var(--accent-primary)]"
                >
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Padrão para Engenharia)</option>
                  <option value="claude-3-haiku">Claude 3.5 Haiku (Respostas Rápidas)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Codex */}
          {activeTab === 'codex' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Codex Test Runner</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Geração automática de suítes de testes unitários
                  </div>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase bg-amber-500/20 px-2 py-0.5 rounded-full">
                  PRONTO
                </span>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1.5">
                  Framework de Teste:
                </label>
                <select
                  value={codexFramework}
                  onChange={(e) => setCodexFramework(e.target.value)}
                  className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-3 py-2 rounded-lg border border-[var(--border-subtle)] outline-none text-xs cursor-pointer focus:border-[var(--accent-primary)]"
                >
                  <option value="vitest">Vitest / Testing Library</option>
                  <option value="jest">Jest</option>
                  <option value="playwright">Playwright</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-end">
          <Button variant="primary" size="sm" onClick={() => setIsIntegrationsOpen(false)}>
            Concluir
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
