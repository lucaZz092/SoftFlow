import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Workflow,
  GitBranch,
  Bot,
  Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';

export const MetricsView: React.FC = () => {
  const { tasks, runLogs } = useProject();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Pronto').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Parado' || t.status === 'Bloqueado').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'Em andamento' || t.status === 'Em Revisão').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusStats = Object.keys(STATUS_CONFIG).map((st) => ({
    status: st,
    count: tasks.filter((t) => t.status === st).length,
    config: STATUS_CONFIG[st],
  }));

  const priorityStats = ['Crítica', 'Alta', 'Média', 'Baixa'].map((p) => ({
    priority: p,
    count: tasks.filter((t) => t.priority === p).length,
    config: PRIORITY_CONFIG[p],
  }));

  const claudeRuns = runLogs.filter((l) => l.integrationType === 'Claude').length;
  const codexRuns = runLogs.filter((l) => l.integrationType === 'Codex').length;
  const gitHubRuns = runLogs.filter((l) => l.integrationType === 'GitHub').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none bg-[#12141a]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Métricas de Entrega &amp; Eficiência</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Indicadores de fluxo contínuo e telemetria de automações com Claude, Codex e GitHub.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-[#161922] border border-[#212633]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Taxa de Entrega</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">{completionRate}%</div>
          <div className="w-full bg-[#1e2330] h-1.5 rounded-full overflow-hidden mt-2.5">
            <div className="bg-emerald-500 h-full" style={{ width: `${completionRate}%` }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono tabular-nums">{completedTasks} de {totalTasks} demandas concluídas</div>
        </div>

        <div className="p-4 rounded-lg bg-[#161922] border border-[#212633]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Em Andamento</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono tabular-nums">{inProgressTasks}</div>
          <div className="text-[11px] text-slate-400 mt-2">Em desenvolvimento ou code review</div>
        </div>

        <div className="p-4 rounded-lg bg-[#161922] border border-[#212633]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Demandas Paradas</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono tabular-nums">{blockedTasks}</div>
          <div className="text-[11px] text-slate-400 mt-2">Aguardando validação externa</div>
        </div>

        <div className="p-4 rounded-lg bg-[#161922] border border-[#212633]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Disparos de Automação</span>
            <Workflow className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-1 font-mono tabular-nums">{runLogs.length}</div>
          <div className="text-[11px] text-emerald-400 mt-2">Ações executadas sem intervenção manual</div>
        </div>
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="p-5 rounded-lg bg-[#161922] border border-[#212633] space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Distribuição por Status
          </h2>
          <div className="space-y-2.5">
            {statusStats.map((st) => {
              const pct = totalTasks > 0 ? Math.round((st.count / totalTasks) * 100) : 0;
              return (
                <div key={st.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{st.status}</span>
                    <span className="font-mono tabular-nums text-slate-400">{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#1e2330] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: st.config.bg }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-5 rounded-lg bg-[#161922] border border-[#212633] space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Demandas por Prioridade
          </h2>
          <div className="space-y-2.5">
            {priorityStats.map((pr) => {
              const pct = totalTasks > 0 ? Math.round((pr.count / totalTasks) * 100) : 0;
              return (
                <div key={pr.priority} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{pr.priority}</span>
                    <span className="font-mono tabular-nums text-slate-400">{pr.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#1e2330] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: pr.config.bg }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model & Webhook Usage */}
      <div className="p-5 rounded-lg bg-[#161922] border border-[#212633] space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Uso das Integrações Ativas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-md bg-[#191d27] border border-[#242936] flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono tabular-nums">{claudeRuns} Refinamentos</div>
              <div className="text-[11px] text-slate-400">Claude 3.5 Sonnet</div>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-[#191d27] border border-[#242936] flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono tabular-nums">{codexRuns} Testes Gerados</div>
              <div className="text-[11px] text-slate-400">Codex Test Engine</div>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-[#191d27] border border-[#242936] flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono tabular-nums">{gitHubRuns} Eventos PR</div>
              <div className="text-[11px] text-slate-400">GitHub Actions Webhook</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
