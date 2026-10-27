import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Button } from './ui/Button';

export const AiSuggestionModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, simulateClaudeRefine, tasks } = useProject();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAiModalOpen) {
        setIsAiModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiModalOpen, setIsAiModalOpen]);

  if (!isAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAiModalOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] shrink-0">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                Sugestões de Otimização do Quadro
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Diagnóstico preditivo baseado no fluxo atual</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content suggestions */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Suggestion 1: Blocker analysis */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-500 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Gargalo Detectado: Demandas Estagnadas</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Existem demandas com status <strong className="text-rose-500">Parado</strong> com prazo de entrega próximo.
            </p>
            <div className="pt-1">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const target = tasks.find((t) => t.status === 'Parado') || tasks[0];
                  if (target) simulateClaudeRefine(target.id);
                  setIsAiModalOpen(false);
                }}
              >
                Acionar Claude para Desbloquear &amp; Refinar
              </Button>
            </div>
          </div>

          {/* Suggestion 2: Automation Recommendation */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-[var(--accent-primary)] font-semibold">
              <Lightbulb className="w-4 h-4" />
              <span>Automação Ativa: Testes Unitários Automáticos</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              O fluxo com <strong className="text-amber-500">Codex</strong> garante cobertura de cenários de borda antes da aprovação do Pull Request no GitHub.
            </p>
            <div className="text-xs text-emerald-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Regra de automação em execução contínua</span>
            </div>
          </div>

          {/* Suggestion 3: Backlog Refinement */}
          <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2.5">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
              <Bot className="w-4 h-4 text-indigo-500" />
              <span>Refinamento em Massa de Critérios de Aceite</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Deseja que o Claude preencha critérios de aceite e estimativa de horas para as demandas que ainda não possuem especificação?
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                tasks.forEach((t) => {
                  if (!t.integrations.claude) simulateClaudeRefine(t.id);
                });
                setIsAiModalOpen(false);
              }}
            >
              Refinar Demandas Pendentes
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => setIsAiModalOpen(false)}>
            Fechar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
