import React from 'react';
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
  GitPullRequest
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

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

  const totalRuns = automations.reduce((acc, a) => acc + a.executionCount, 0);
  const activeCount = automations.filter((a) => a.enabled).length;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 select-none bg-[#12141a]">
      {/* Top Banner & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-lg bg-[#161922] border border-[#212633]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Workflow className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold text-white tracking-tight">Central de Automações &amp; Fluxos</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Orquestração contínua entre GitHub, Claude (especificação ágil) e Codex (geração de suítes de testes unitários).
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsIntegrationsOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#1e2330] hover:bg-[#252c3c] text-slate-200 text-xs font-medium border border-[#2b3243] transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Configurar Conexões</span>
          </button>
          <button
            onClick={() => setIsNewAutomationOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-[#0073ea] hover:bg-[#0062c7] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Nova Automação</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-lg bg-[#161922] border border-[#212633]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fluxos em Produção</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">{activeCount} / {automations.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Todas as regras ativas operando normalmente</div>
        </div>

        <div className="p-4 rounded-lg bg-[#161922] border border-[#212633]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Disparos Executados</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">{totalRuns}</div>
          <div className="text-[11px] text-slate-400 mt-1">Webhooks de PRs, revisões e triagens</div>
        </div>

        <div className="p-4 rounded-lg bg-[#161922] border border-[#212633]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Taxa de Confiabilidade</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono tabular-nums">100%</div>
          <div className="text-[11px] text-slate-400 mt-1">0 falhas de execução registradas</div>
        </div>
      </div>

      {/* Quick Webhook Trigger Simulator Bar */}
      <div className="p-3.5 rounded-lg bg-[#161922] border border-[#212633] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-white">Simulador de Eventos de Webhook:</span>
          <span className="text-slate-400">Teste o acionamento em tempo real dos fluxos</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => simulateGitHubEvent('PR_MERGED')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#1e2330] hover:bg-[#252c3c] text-purple-300 text-xs border border-[#2b3243] transition-colors cursor-pointer"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Simular PR #42 Merged</span>
          </button>
          <button
            onClick={() => simulateGitHubEvent('PR_OPENED')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#1e2330] hover:bg-[#252c3c] text-emerald-300 text-xs border border-[#2b3243] transition-colors cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Simular Novo PR Aberto</span>
          </button>
        </div>
      </div>

      {/* Active Workflows Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Regras de Automação ({automations.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {automations.map((wf) => {
            return (
              <div
                key={wf.id}
                className={`p-4 rounded-lg border transition-all ${
                  wf.enabled
                    ? 'bg-[#161922] border-[#242938] hover:border-[#2e3547]'
                    : 'bg-[#14161f] border-[#1e222e] opacity-60'
                }`}
              >
                {/* Header: Name and Toggle */}
                <div className="flex items-start justify-between gap-4 pb-2.5 border-b border-[#202532]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-xs">{wf.name}</h3>
                      {wf.action.integrationIcon === 'github' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-900/30 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                          <GitBranch className="w-3 h-3" />
                          <span>GitHub</span>
                        </span>
                      )}
                      {wf.action.integrationIcon === 'codex' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-900/30 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Codex</span>
                        </span>
                      )}
                      {wf.action.integrationIcon === 'claude' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                          <Bot className="w-3 h-3" />
                          <span>Claude</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">{wf.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleAutomation(wf.id)}
                      className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        wf.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          wf.enabled ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => deleteAutomation(wf.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Excluir fluxo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Step Flow diagram */}
                <div className="py-3 flex flex-wrap items-center gap-2 text-xs">
                  {/* Step 1: Trigger */}
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#1b1f2b] border border-[#262c3b] text-slate-200">
                    <span className="text-[10px] font-bold text-blue-400">QUANDO</span>
                    <span className="font-medium text-white">{wf.trigger.label}</span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

                  {/* Step 2: Condition (if any) */}
                  {wf.condition && (
                    <>
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#1b1f2b] border border-[#262c3b] text-slate-300">
                        <span className="text-[10px] font-bold text-amber-400">SE</span>
                        <span>{wf.condition.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </>
                  )}

                  {/* Step 3: Action */}
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#1b1f2b] border border-[#262c3b] text-slate-200">
                    <span className="text-[10px] font-bold text-emerald-400">ENTÃO</span>
                    <span className="font-semibold text-white">{wf.action.label}</span>
                  </div>
                </div>

                {/* Footer stats & Test button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#202532] text-[11px] text-slate-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Última execução: {wf.lastRunAt || 'Nunca'}</span>
                    </span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {wf.executionCount} disparos
                    </span>
                  </div>

                  <button
                    onClick={() => triggerManualAutomation(wf.id)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1e2330] hover:bg-[#252c3c] text-emerald-400 font-medium transition-colors cursor-pointer text-xs border border-[#2b3243]"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Testar agora</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Run Log / Audit Trail */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Histórico de Execuções em Tempo Real
            </h2>
          </div>
          <span className="text-xs text-slate-500">Eventos de webhooks e modelos conectados</span>
        </div>

        <div className="rounded-lg border border-[#212633] bg-[#161922] overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#212633] text-[11px] font-semibold text-slate-400 bg-[#171b25]">
                <th className="px-3.5 py-2">Horário</th>
                <th className="px-3.5 py-2">Fluxo</th>
                <th className="px-3.5 py-2">Demanda Afetada</th>
                <th className="px-3.5 py-2">Integração</th>
                <th className="px-3.5 py-2">Status</th>
                <th className="px-3.5 py-2">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202532]">
              {runLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1a1e28] transition-colors">
                  <td className="px-3.5 py-2 text-slate-400 font-mono tabular-nums text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-3.5 py-2 font-medium text-white">{log.workflowName}</td>
                  <td className="px-3.5 py-2 text-slate-300">{log.taskTitle}</td>
                  <td className="px-3.5 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        log.integrationType === 'Codex'
                          ? 'bg-amber-900/30 text-amber-300 border border-amber-500/30'
                          : log.integrationType === 'Claude'
                          ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-500/30'
                          : log.integrationType === 'GitHub'
                          ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-900/30 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {log.integrationType}
                    </span>
                  </td>
                  <td className="px-3.5 py-2">
                    <span className="flex items-center space-x-1 text-emerald-400 font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sucesso</span>
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-slate-300 text-[11px] font-mono leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
