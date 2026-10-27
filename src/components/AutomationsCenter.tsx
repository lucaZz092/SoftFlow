import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  GitBranch,
  Bot,
  Zap,
  Clock,
  ArrowRight,
  Sliders,
  History,
  Trash2,
  GitPullRequest,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';

export const AutomationsCenter: React.FC = () => {
  const {
    automations,
    runLogs,
    toggleAutomation,
    deleteAutomation,
    triggerManualAutomation,
    setIsNewAutomationOpen,
    setIsIntegrationsOpen,
    simulateGitHubEvent,
  } = useProject();

  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

  const totalRuns = automations.reduce((acc, a) => acc + a.executionCount, 0);
  const activeCount = automations.filter((a) => a.enabled).length;

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 select-none bg-[var(--bg-canvas)] transition-colors">
      {/* Top Banner & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-[var(--accent-primary)]" />
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Central de Automações &amp; Fluxos
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Orquestração contínua entre GitHub, Claude 3.5 (especificação ágil) e Codex (geração de testes unitários).
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsIntegrationsOpen(true)}
            leftIcon={<Sliders className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Configurar Conexões
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewAutomationOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Criar Nova Automação
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Fluxos em Produção
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1.5 font-mono tabular-nums">
            {activeCount} / {automations.length}
          </div>
          <div className="text-xs text-emerald-500 font-medium mt-1">
            {activeCount === automations.length ? 'Todas as regras ativas' : `${activeCount} fluxos executando`}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Disparos Executados
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1.5 font-mono tabular-nums">
            {totalRuns}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Webhooks de PRs, revisões e triagens</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Taxa de Confiabilidade
          </div>
          <div className="text-2xl font-bold text-emerald-500 mt-1.5 font-mono tabular-nums">100%</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">0 falhas de execução registradas</div>
        </div>
      </div>

      {/* Quick Webhook Trigger Simulator Bar */}
      <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[var(--text-primary)]">Simulador de Eventos de Webhook:</span>
          <span className="text-[var(--text-muted)] hidden sm:inline">Dispare eventos em tempo real para verificar gatilhos</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => simulateGitHubEvent('PR_MERGED')}
            leftIcon={<GitPullRequest className="w-3.5 h-3.5 text-purple-500" />}
          >
            Simular PR Merged
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => simulateGitHubEvent('PR_OPENED')}
            leftIcon={<GitBranch className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Simular Novo PR
          </Button>
        </div>
      </div>

      {/* Active Workflows Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Regras de Automação ({automations.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {automations.map((wf) => {
            return (
              <div
                key={wf.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all shadow-xs ${
                  wf.enabled
                    ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                    : 'bg-[var(--bg-surface)]/60 border-[var(--border-subtle)] opacity-60'
                }`}
              >
                {/* Header: Name and Toggle */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[var(--text-primary)] text-sm">{wf.name}</h3>
                      {wf.action.integrationIcon === 'github' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          <span>GitHub</span>
                        </span>
                      )}
                      {wf.action.integrationIcon === 'codex' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Codex</span>
                        </span>
                      )}
                      {wf.action.integrationIcon === 'claude' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-[var(--accent-primary)] border border-blue-500/20 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          <span>Claude</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                      {wf.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={wf.enabled}
                      onClick={() => toggleAutomation(wf.id)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                        wf.enabled ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          wf.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkflowToDelete(wf.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer rounded-md hover:bg-rose-500/10"
                      title="Excluir fluxo"
                      aria-label="Excluir fluxo de automação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Step Flow diagram */}
                <div className="py-3.5 flex flex-wrap items-center gap-2 text-xs">
                  {/* Step 1: Trigger */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase">QUANDO</span>
                    <span className="font-medium">{wf.trigger.label}</span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />

                  {/* Step 2: Condition (if any) */}
                  {wf.condition && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                        <span className="text-[10px] font-bold text-amber-500 uppercase">SE</span>
                        <span>{wf.condition.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    </>
                  )}

                  {/* Step 3: Action */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">ENTÃO</span>
                    <span className="font-semibold">{wf.action.label}</span>
                  </div>
                </div>

                {/* Footer stats & Test button */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Última execução: {wf.lastRunAt || 'Nunca'}</span>
                    </span>
                    <span className="font-mono tabular-nums">{wf.executionCount} disparos</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => triggerManualAutomation(wf.id)}
                    leftIcon={<Play className="w-3 h-3 fill-current text-emerald-500" />}
                    className="text-emerald-500 hover:text-emerald-600"
                  >
                    Testar agora
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Run Log / Audit Trail */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Histórico de Execuções em Tempo Real
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)]">Eventos de webhooks e modelos conectados</span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-canvas)]">
                <th className="px-4 py-2.5">Horário</th>
                <th className="px-4 py-2.5">Fluxo</th>
                <th className="px-4 py-2.5">Demanda Afetada</th>
                <th className="px-4 py-2.5">Integração</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {runLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <td className="px-4 py-2.5 text-[var(--text-muted)] font-mono tabular-nums text-xs whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-[var(--text-primary)]">{log.workflowName}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{log.taskTitle}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        log.integrationType === 'Codex'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : log.integrationType === 'Claude'
                          ? 'bg-blue-500/10 text-[var(--accent-primary)] border-blue-500/20'
                          : log.integrationType === 'GitHub'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      }`}
                    >
                      {log.integrationType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sucesso</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)] text-xs font-mono leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Automation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(workflowToDelete)}
        onClose={() => setWorkflowToDelete(null)}
        onConfirm={() => {
          if (workflowToDelete) {
            deleteAutomation(workflowToDelete);
            setWorkflowToDelete(null);
          }
        }}
        title="Excluir Automação"
        description="Tem certeza de que deseja excluir este fluxo de automação? Ele deixará de ser disparado em eventos futuros."
        confirmText="Excluir Automação"
      />
    </div>
  );
};
