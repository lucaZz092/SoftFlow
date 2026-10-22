import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { AutomationTriggerType, AutomationActionType, TaskStatus } from '../types';
import { Button } from './ui/Button';

export const NewAutomationModal: React.FC = () => {
  const { isNewAutomationOpen, setIsNewAutomationOpen, addAutomation, groups } = useProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<AutomationTriggerType>('STATUS_CHANGE');
  const [targetStatus, setTargetStatus] = useState<TaskStatus>('Em Revisão');
  const [actionType, setActionType] = useState<AutomationActionType>('CODEX_GENERATE_TESTS');
  const [actionStatus, setActionStatus] = useState<TaskStatus>('Pronto');
  const [actionGroup, setActionGroup] = useState<string>(groups[0]?.id || 'group-marketing');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNewAutomationOpen) {
        setIsNewAutomationOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewAutomationOpen, setIsNewAutomationOpen]);

  if (!isNewAutomationOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let triggerLabel = 'Quando o evento acontecer';
    if (triggerType === 'STATUS_CHANGE') triggerLabel = `Quando o status mudar para "${targetStatus}"`;
    if (triggerType === 'GITHUB_PR_MERGED') triggerLabel = 'Quando um PR for mesclado no GitHub';
    if (triggerType === 'GITHUB_PR_OPENED') triggerLabel = 'Quando um novo PR for aberto no GitHub';
    if (triggerType === 'TASK_CREATED') triggerLabel = 'Quando uma nova demanda for criada';
    if (triggerType === 'PRIORITY_SET_CRITICAL') triggerLabel = 'Quando a prioridade for definida como Crítica';

    let actionLabel = 'Executar ação';
    let icon: 'claude' | 'codex' | 'github' | 'monday' = 'monday';

    if (actionType === 'CODEX_GENERATE_TESTS') {
      actionLabel = 'Gerar suíte de testes unitários com Codex';
      icon = 'codex';
    } else if (actionType === 'CLAUDE_REFINE') {
      actionLabel = 'Refinar critérios de aceite e histórias com Claude';
      icon = 'claude';
    } else if (actionType === 'GITHUB_CREATE_BRANCH') {
      actionLabel = 'Criar branch feature/ no repositório GitHub';
      icon = 'github';
    } else if (actionType === 'SET_STATUS') {
      actionLabel = `Alterar status para "${actionStatus}"`;
      icon = 'monday';
    } else if (actionType === 'MOVE_TO_GROUP') {
      const gTitle = groups.find((g) => g.id === actionGroup)?.title || 'outro grupo';
      actionLabel = `Mover para o grupo "${gTitle}"`;
      icon = 'monday';
    } else if (actionType === 'NOTIFY_TEAM') {
      actionLabel = 'Disparar notificação de bloqueio para o time';
      icon = 'monday';
    }

    addAutomation({
      name: name || `${triggerLabel} -> ${actionLabel}`,
      description: description || `Regra de fluxo contínuo configurada para acelerar a entrega da demanda.`,
      enabled: true,
      trigger: {
        type: triggerType,
        targetStatus: triggerType === 'STATUS_CHANGE' ? targetStatus : undefined,
        label: triggerLabel,
      },
      action: {
        type: actionType,
        label: actionLabel,
        targetStatus: actionType === 'SET_STATUS' ? actionStatus : undefined,
        targetGroupId: actionType === 'MOVE_TO_GROUP' ? actionGroup : undefined,
        integrationIcon: icon,
      },
    });

    setIsNewAutomationOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsNewAutomationOpen(false)}
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
            <div className="w-8 h-8 rounded-lg bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center text-[#0066ff] shrink-0">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                Criar Nova Automação
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Configure gatilhos e ações de fluxo contínuo</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNewAutomationOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          <div>
            <label className="block text-[var(--text-secondary)] font-medium mb-1.5">
              Nome da Automação (Opcional):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Quando PR for merged -> Mover para Pronto"
              className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-3 py-2 rounded-lg border border-[var(--border-subtle)] outline-none text-xs focus:border-[#0066ff]"
            />
          </div>

          {/* Trigger Section */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2.5">
            <span className="text-[10px] font-bold text-[#0066ff] uppercase tracking-wider block">
              1. Gatilho (QUANDO ISTO ACONTECER):
            </span>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as AutomationTriggerType)}
              className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-2 rounded-lg border border-[var(--border-subtle)] outline-none text-xs cursor-pointer focus:border-[#0066ff]"
            >
              <option value="STATUS_CHANGE">O status de uma demanda for alterado</option>
              <option value="GITHUB_PR_MERGED">Um Pull Request for mesclado no GitHub</option>
              <option value="GITHUB_PR_OPENED">Um novo Pull Request for aberto no GitHub</option>
              <option value="TASK_CREATED">Uma nova demanda for criada no quadro</option>
              <option value="PRIORITY_SET_CRITICAL">A prioridade for alterada para Crítica</option>
            </select>

            {triggerType === 'STATUS_CHANGE' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[var(--text-muted)] text-[11px]">Para o status:</span>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as TaskStatus)}
                  className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs font-semibold cursor-pointer focus:border-[#0066ff]"
                >
                  {['A Fazer', 'Trabalhando nisso', 'Em andamento', 'Em Revisão', 'Parado', 'Pronto'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Section */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2.5">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">
              2. Ação (ENTÃO FAZER ISTO):
            </span>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as AutomationActionType)}
              className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-2 rounded-lg border border-[var(--border-subtle)] outline-none text-xs cursor-pointer focus:border-[#0066ff]"
            >
              <option value="CODEX_GENERATE_TESTS">Acionar Codex para gerar testes unitários (Vitest)</option>
              <option value="CLAUDE_REFINE">Acionar Claude para refinar histórias e critérios</option>
              <option value="GITHUB_CREATE_BRANCH">Criar branch padronizada feature/ no GitHub</option>
              <option value="SET_STATUS">Alterar status da demanda</option>
              <option value="MOVE_TO_GROUP">Mover demanda para outro grupo</option>
              <option value="NOTIFY_TEAM">Notificar a equipe de engenharia</option>
            </select>

            {actionType === 'SET_STATUS' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[var(--text-muted)] text-[11px]">Definir para:</span>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as TaskStatus)}
                  className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs font-semibold cursor-pointer focus:border-[#0066ff]"
                >
                  {['A Fazer', 'Trabalhando nisso', 'Em andamento', 'Em Revisão', 'Parado', 'Pronto'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {actionType === 'MOVE_TO_GROUP' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[var(--text-muted)] text-[11px]">Mover para:</span>
                <select
                  value={actionGroup}
                  onChange={(e) => setActionGroup(e.target.value)}
                  className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs cursor-pointer focus:border-[#0066ff]"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2.5 pt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsNewAutomationOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Criar Automação
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
