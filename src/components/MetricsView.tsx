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
import { STATUS_STYLES, PRIORITY_STYLES } from '../styles/designSystem';

export const MetricsView: React.FC = () => {
  const { tasks, runLogs } = useProject();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Pronto').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Parado' || t.status === 'Bloqueado').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'Em andamento' || t.status === 'Em Revisão' || t.status === 'Trabalhando nisso').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusStats = (['Pronto', 'Trabalhando nisso', 'Em andamento', 'Em Revisão', 'Parado', 'A Fazer'] as const).map((st) => ({
    status: st,
    count: tasks.filter((t) => t.status === st).length,
    style: STATUS_STYLES[st] || STATUS_STYLES['Novo'],
  }));

  const priorityStats = (['Crítica', 'Alta', 'Média', 'Baixa'] as const).map((p) => ({
    priority: p,
    count: tasks.filter((t) => t.priority === p).length,
    style: PRIORITY_STYLES[p] || PRIORITY_STYLES['Média'],
  }));

  const claudeRuns = runLogs.filter((l) => l.integrationType === 'Claude').length;
  const codexRuns = runLogs.filter((l) => l.integrationType === 'Codex').length;
  const gitHubRuns = runLogs.filter((l) => l.integrationType === 'GitHub').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none bg-[var(--bg-canvas)] transition-colors">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>Métricas de Entrega &amp; Eficiência</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Indicadores de fluxo contínuo e telemetria de automações com Claude, Codex e GitHub.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            <span>Taxa de Entrega</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2 font-mono tabular-nums">{completionRate}%</div>
          <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden mt-3 border border-[var(--border-subtle)]">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${completionRate}%` }} />
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-2 font-mono tabular-nums">
            {completedTasks} de {totalTasks} demandas concluídas
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            <span>Em Andamento</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500 mt-2 font-mono tabular-nums">{inProgressTasks}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-3">Em desenvolvimento ou code review</div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            <span>Demandas Bloqueadas</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-500 mt-2 font-mono tabular-nums">{blockedTasks}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-3">Aguardando validação ou dependência</div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            <span>Disparos de Automação</span>
            <Workflow className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--accent-primary)] mt-2 font-mono tabular-nums">{runLogs.length}</div>
          <div className="text-xs text-emerald-500 font-medium mt-3">Execuções sem intervenção manual</div>
        </div>
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3.5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Distribuição por Status
          </h2>
          <div className="space-y-3">
            {statusStats.map((st) => {
              const pct = totalTasks > 0 ? Math.round((st.count / totalTasks) * 100) : 0;
              return (
                <div key={st.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-primary)] font-medium">{st.status}</span>
                    <span className="font-mono tabular-nums text-[var(--text-muted)]">
                      {st.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full rounded-full transition-all bg-[var(--accent-primary)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3.5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Demandas por Prioridade
          </h2>
          <div className="space-y-3">
            {priorityStats.map((pr) => {
              const pct = totalTasks > 0 ? Math.round((pr.count / totalTasks) * 100) : 0;
              return (
                <div key={pr.priority} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-primary)] font-medium">{pr.priority}</span>
                    <span className="font-mono tabular-nums text-[var(--text-muted)]">
                      {pr.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full rounded-full transition-all bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model & Webhook Usage */}
      <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3.5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Uso das Integrações Ativas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--text-primary)] font-mono tabular-nums">
                {claudeRuns} Refinamentos
              </div>
              <div className="text-xs text-[var(--text-muted)]">Claude 3.5 Sonnet</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--text-primary)] font-mono tabular-nums">
                {codexRuns} Testes Gerados
              </div>
              <div className="text-xs text-[var(--text-muted)]">Codex Test Engine</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--text-primary)] font-mono tabular-nums">
                {gitHubRuns} Eventos PR
              </div>
              <div className="text-xs text-[var(--text-muted)]">GitHub Actions Webhook</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
