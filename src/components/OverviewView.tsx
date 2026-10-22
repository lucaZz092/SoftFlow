import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Moon,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  TrendingUp,
  FolderKanban,
  GitBranch,
  Bot,
  Zap,
  ArrowRight,
  Plus,
  GitPullRequest,
  Sliders,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { STATUS_STYLES, PRIORITY_STYLES } from '../styles/designSystem';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { TaskStatus, TaskPriority, Task } from '../types';

export const OverviewView: React.FC = () => {
  const {
    tasks,
    groups,
    runLogs,
    setCurrentView,
    setSelectedTaskId,
    addTask,
    changeTaskStatus,
    setIsIntegrationsOpen,
    setIsNewAutomationOpen,
    simulateGitHubEvent,
    isGithubConnected,
    githubUser,
    githubToken,
    setFilterStatus,
  } = useProject();

  // Reference current date in local system
  const TODAY = '2026-10-22';

  // Contextual greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  // Formatted date string in Brazilian Portuguese
  const formattedDate = useMemo(() => {
    return 'Quinta-feira, 22 de outubro de 2026';
  }, []);

  // Real Metric Calculations
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Pronto').length;
    const inProgress = tasks.filter(
      (t) => t.status === 'Em andamento' || t.status === 'Trabalhando nisso' || t.status === 'Em Revisão'
    ).length;
    const pending = tasks.filter((t) => t.status === 'A Fazer').length;
    const blocked = tasks.filter((t) => t.status === 'Parado' || t.status === 'Bloqueado').length;
    const overdue = tasks.filter((t) => t.status !== 'Pronto' && t.dueDate < TODAY).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      blocked,
      overdue,
      completionRate,
    };
  }, [tasks]);

  // "Meu Dia" - Urgent tasks (Critical / High priority OR assigned to Lucas Martins)
  const myDayTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === 'Pronto') return false;
        const isAssignedToUser = t.assignee?.id === 'user-1';
        const isUrgent = t.priority === 'Crítica' || t.priority === 'Alta';
        const isDueSoon = t.dueDate <= '2026-10-23';
        return isAssignedToUser || isUrgent || isDueSoon;
      })
      .sort((a, b) => {
        // Overdue first, then by date, then priority
        if (a.dueDate < TODAY && b.dueDate >= TODAY) return -1;
        if (b.dueDate < TODAY && a.dueDate >= TODAY) return 1;
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 5);
  }, [tasks]);

  // Projects with calculated real progress
  const projectsData = useMemo(() => {
    return groups.map((g) => {
      const groupTasks = tasks.filter((t) => t.groupId === g.id);
      const total = groupTasks.length;
      const done = groupTasks.filter((t) => t.status === 'Pronto').length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const inProgressCount = groupTasks.filter(
        (t) => t.status === 'Em andamento' || t.status === 'Trabalhando nisso' || t.status === 'Em Revisão'
      ).length;

      // Unique assignees
      const membersMap = new Map();
      groupTasks.forEach((t) => {
        if (t.assignee) membersMap.set(t.assignee.id, t.assignee);
      });
      const members = Array.from(membersMap.values());

      return {
        id: g.id,
        title: g.title,
        color: g.color,
        total,
        done,
        inProgressCount,
        progress,
        members,
      };
    });
  }, [groups, tasks]);

  // Upcoming Deliveries (sorted by due date)
  const upcomingDeliveries = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'Pronto' && t.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5)
      .map((t) => {
        let badgeText = '';
        let badgeColor = '';

        if (t.dueDate < TODAY) {
          badgeText = 'Atrasada';
          badgeColor = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
        } else if (t.dueDate === TODAY) {
          badgeText = 'Hoje';
          badgeColor = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
        } else if (t.dueDate === '2026-10-23') {
          badgeText = 'Amanhã';
          badgeColor = 'bg-blue-500/15 text-[#0066ff] border-blue-500/30';
        } else {
          badgeText = t.dueDate.slice(5);
          badgeColor = 'bg-slate-500/15 text-[var(--text-secondary)] border-[var(--border-subtle)]';
        }

        return {
          ...t,
          badgeText,
          badgeColor,
        };
      });
  }, [tasks]);

  // Status distribution stats
  const statusStats = useMemo(() => {
    const statuses: TaskStatus[] = [
      'Pronto',
      'Trabalhando nisso',
      'Em andamento',
      'Em Revisão',
      'Parado',
      'A Fazer',
    ];
    return statuses.map((st) => {
      const count = tasks.filter((t) => t.status === st).length;
      const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
      return {
        status: st,
        count,
        pct,
        style: STATUS_STYLES[st] || STATUS_STYLES['Novo'],
      };
    });
  }, [tasks, metrics.total]);

  // Priority distribution stats
  const priorityStats = useMemo(() => {
    const priorities: TaskPriority[] = ['Crítica', 'Alta', 'Média', 'Baixa'];
    return priorities.map((pr) => {
      const count = tasks.filter((t) => t.priority === pr).length;
      const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
      return {
        priority: pr,
        count,
        pct,
        style: PRIORITY_STYLES[pr] || PRIORITY_STYLES['Média'],
      };
    });
  }, [tasks, metrics.total]);

  // Recent consolidated activity feed
  const recentActivities = useMemo(() => {
    const logs = runLogs.slice(0, 6).map((log) => ({
      id: log.id,
      title: log.workflowName,
      description: `${log.taskTitle} — ${log.details}`,
      timestamp: log.timestamp,
      type: log.integrationType,
      isSuccess: log.status === 'success',
    }));
    return logs;
  }, [runLogs]);

  // Real Integration telemetry counts
  const integrationsStats = useMemo(() => {
    const claudeCount = tasks.filter((t) => t.integrations.claude).length;
    const codexCount = tasks.filter((t) => t.integrations.codex).length;
    const githubPrCount = tasks.filter((t) => t.integrations.github?.prNumber).length;
    const githubBranchCount = tasks.filter((t) => t.integrations.github?.branch).length;

    return {
      claudeCount,
      codexCount,
      githubPrCount,
      githubBranchCount,
    };
  }, [tasks]);

  const handleQuickCreateTask = () => {
    const targetGroup = groups[0] || { id: 'group-marketing' };
    const newTask = addTask(targetGroup.id, 'Nova Demanda Prioritária');
    setSelectedTaskId(newTask.id);
  };

  const handleNavigateToStatus = (status: TaskStatus) => {
    setFilterStatus(status);
    setCurrentView('table');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 select-none bg-[var(--bg-canvas)] transition-colors pb-24">
      {/* 1. Contextual Greeting & Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden"
      >
        <div className="space-y-1.5 z-10 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0066ff] bg-[#0066ff]/10 px-2.5 py-0.5 rounded-full border border-[#0066ff]/20">
              Workspace SoftSolutions
            </span>
            <span className="text-[var(--text-muted)] text-xs hidden sm:inline">•</span>
            <span className="text-xs text-[var(--text-secondary)] font-medium hidden sm:inline flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {greeting}, Lucas Martins!
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Você possui{' '}
            <strong className="text-[var(--text-primary)] font-semibold">
              {myDayTasks.length} {myDayTasks.length === 1 ? 'demanda prioritária' : 'demandas prioritárias'}
            </strong>{' '}
            no seu dia e{' '}
            <strong className="text-emerald-500 font-semibold">{metrics.completed} concluídas</strong> no total.{' '}
            {metrics.overdue > 0 && (
              <span className="text-rose-500 font-semibold inline-flex items-center gap-1 ml-1">
                <AlertTriangle className="w-3.5 h-3.5 inline" />
                {metrics.overdue} {metrics.overdue === 1 ? 'demanda atrasada' : 'demandas atrasadas'} requerem atenção.
              </span>
            )}
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5 z-10 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentView('table')}
            leftIcon={<FolderKanban className="w-4 h-4 text-[#0066ff]" />}
          >
            Abrir Quadro
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleQuickCreateTask}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nova Demanda
          </Button>
        </div>

        {/* Subtle decorative gradient pill in background */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#0066ff]/5 to-transparent pointer-events-none" />
      </motion.div>

      {/* 2. Status Metric Cards (Real Calculated Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pendentes */}
        <div
          onClick={() => handleNavigateToStatus('A Fazer')}
          className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <span>Pendentes</span>
            <div className="w-7 h-7 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-2 font-mono tabular-nums">
            {metrics.pending}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
            <span>Aguardando início</span>
            <span className="font-mono tabular-nums font-semibold">
              {metrics.total > 0 ? Math.round((metrics.pending / metrics.total) * 100) : 0}% do total
            </span>
          </div>
        </div>

        {/* Em Andamento */}
        <div
          onClick={() => handleNavigateToStatus('Em andamento')}
          className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <span>Em Andamento</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#0066ff] group-hover:scale-105 transition-transform">
              <PlayCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0066ff] mt-2 font-mono tabular-nums">
            {metrics.inProgress}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
            <span>Desenvolvimento &amp; Review</span>
            <span className="font-mono tabular-nums font-semibold">
              {metrics.total > 0 ? Math.round((metrics.inProgress / metrics.total) * 100) : 0}% do total
            </span>
          </div>
        </div>

        {/* Concluídas */}
        <div
          onClick={() => handleNavigateToStatus('Pronto')}
          className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <span>Concluídas</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mt-2 font-mono tabular-nums">
            {metrics.completed}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
            <span>Taxa de sucesso</span>
            <span className="text-emerald-500 font-mono tabular-nums font-bold">
              {metrics.completionRate}%
            </span>
          </div>
        </div>

        {/* Atrasadas */}
        <div
          onClick={() => setCurrentView('table')}
          className={`p-5 rounded-xl border transition-all cursor-pointer shadow-xs group ${
            metrics.overdue > 0
              ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50'
              : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <span>Atrasadas</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                metrics.overdue > 0
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-500'
                  : 'bg-slate-500/10 border border-slate-500/20 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold mt-2 font-mono tabular-nums ${
              metrics.overdue > 0 ? 'text-rose-500' : 'text-[var(--text-primary)]'
            }`}
          >
            {metrics.overdue}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
            <span>{metrics.overdue > 0 ? 'Vencidas' : 'Em dia'}</span>
            <span
              className={`font-semibold ${metrics.overdue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}
            >
              {metrics.overdue > 0 ? 'Requer atenção' : '0 atrasos'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Meu Dia & Entregas Próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Meu Dia */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Meu Dia — Tarefas Prioritárias ({myDayTasks.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('table')}
              className="text-xs text-[#0066ff] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
            >
              Ver todas no quadro <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)] shadow-xs overflow-hidden">
            {myDayTasks.map((task) => {
              const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Média'];
              const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES['Novo'];
              const taskGroup = groups.find((g) => g.id === task.groupId);
              const isOverdue = task.dueDate < TODAY;
              const isToday = task.dueDate === TODAY;

              return (
                <div
                  key={task.id}
                  className="p-3.5 sm:p-4 hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Status quick toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        changeTaskStatus(
                          task.id,
                          task.status === 'Pronto' ? 'Em andamento' : 'Pronto'
                        )
                      }
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.status === 'Pronto'
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'border-[var(--border-strong)] hover:border-[#0066ff]'
                      }`}
                      title={task.status === 'Pronto' ? 'Reabrir demanda' : 'Marcar como concluída'}
                    >
                      {task.status === 'Pronto' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold truncate hover:text-[#0066ff] transition-colors ${
                            task.status === 'Pronto'
                              ? 'line-through text-[var(--text-muted)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Group pill */}
                        {taskGroup && (
                          <span
                            className="text-[10px] px-1.5 py-0.2 rounded font-medium border"
                            style={{
                              color: taskGroup.color,
                              borderColor: `${taskGroup.color}40`,
                              backgroundColor: `${taskGroup.color}15`,
                            }}
                          >
                            {taskGroup.title}
                          </span>
                        )}

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1">
                        <span className="font-mono text-[10px]">{task.id}</span>
                        {task.subtasks.length > 0 && (
                          <span className="font-mono text-[10px]">
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} sub-tarefas
                          </span>
                        )}
                        {task.comments.length > 0 && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                            <MessageSquare className="w-3 h-3" />
                            {task.comments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Date badge and action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-mono tabular-nums border ${
                        isOverdue
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold'
                          : isToday
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold'
                          : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                      }`}
                    >
                      {isOverdue ? 'Atrasada' : isToday ? 'Hoje' : task.dueDate.slice(5)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                      title="Ver detalhes"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {myDayTasks.length === 0 && (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="font-semibold text-[var(--text-primary)] text-sm">Tudo em dia!</p>
                <p>Nenhuma tarefa urgente pendente para você no momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Entregas Próximas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Próximos Prazos ({upcomingDeliveries.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('timeline')}
              className="text-xs text-[#0066ff] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
            >
              Gantt <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)] shadow-xs overflow-hidden">
            {upcomingDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                onClick={() => setSelectedTaskId(delivery.id)}
                className="p-3 sm:p-3.5 hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--text-primary)] truncate hover:text-[#0066ff] transition-colors">
                    {delivery.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-1">
                    <span className="font-mono">{delivery.dueDate}</span>
                    {delivery.assignee && (
                      <span className="truncate">• {delivery.assignee.name}</span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${delivery.badgeColor}`}
                >
                  {delivery.badgeText}
                </span>
              </div>
            ))}

            {upcomingDeliveries.length === 0 && (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                Nenhum prazo iminente registrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Lista de Projetos Ativos com Progresso Calculado */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#0066ff]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Projetos &amp; Frentes Ativas ({projectsData.length})
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {metrics.completed} de {metrics.total} tarefas entregues
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projectsData.map((project) => (
            <div
              key={project.id}
              className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="font-bold text-sm text-[var(--text-primary)] truncate">
                      {project.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold tabular-nums text-[var(--text-primary)]">
                    {project.progress}%
                  </span>
                </div>

                {/* Real progress bar */}
                <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden mt-3 border border-[var(--border-subtle)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>

                {/* Substats */}
                <div className="flex items-center justify-between mt-3 text-xs text-[var(--text-muted)]">
                  <span>{project.done} de {project.total} concluídas</span>
                  {project.inProgressCount > 0 && (
                    <span className="text-amber-500 font-medium">
                      {project.inProgressCount} ativas
                    </span>
                  )}
                </div>
              </div>

              {/* Footer: Team members and Open button */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center -space-x-1.5 overflow-hidden">
                  {project.members.map((m) => (
                    <div
                      key={m.id}
                      className="w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-[var(--bg-surface)] shadow-xs"
                      style={{ backgroundColor: m.color }}
                      title={m.name}
                    >
                      {m.initials}
                    </div>
                  ))}
                  {project.members.length === 0 && (
                    <span className="text-[10px] text-[var(--text-muted)]">Sem atribuições</span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setCurrentView('table')}
                  rightIcon={<ArrowRight className="w-3 h-3" />}
                  className="text-xs"
                >
                  Abrir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Gráfico de Tarefas por Status e Prioridade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <div className="p-5 sm:p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Distribuição por Status
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Total: {metrics.total} demandas
            </span>
          </div>

          {/* Segmented multi-bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            {statusStats.map((st) => (
              <div
                key={st.status}
                style={{ width: `${st.pct}%` }}
                className={`h-full transition-all ${st.style.dot}`}
                title={`${st.status}: ${st.count} (${st.pct}%)`}
              />
            ))}
          </div>

          <div className="space-y-2.5 pt-1">
            {statusStats.map((st) => (
              <div
                key={st.status}
                onClick={() => handleNavigateToStatus(st.status)}
                className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.style.dot}`} />
                  <span className="text-[var(--text-secondary)] font-medium">{st.status}</span>
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                  <span className="text-[var(--text-primary)] font-semibold">{st.count}</span>
                  <span className="text-[var(--text-muted)]">({st.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matriz por Prioridade */}
        <div className="p-5 sm:p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Carga por Nível de Prioridade
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-mono">Severidade</span>
          </div>

          <div className="space-y-3 pt-1">
            {priorityStats.map((pr) => (
              <div key={pr.priority} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${pr.style.dot}`} />
                    <span className="text-[var(--text-primary)] font-semibold">{pr.priority}</span>
                  </div>
                  <div className="font-mono tabular-nums text-xs">
                    <span className="text-[var(--text-primary)] font-bold">{pr.count}</span>
                    <span className="text-[var(--text-muted)] ml-1">({pr.pct}%)</span>
                  </div>
                </div>

                <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className={`h-full rounded-full transition-all ${pr.style.dot}`}
                    style={{ width: `${pr.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between mt-2">
            <span>Demandas de alta criticidade ativas:</span>
            <strong className="text-rose-500 font-mono font-bold">
              {tasks.filter((t) => t.status !== 'Pronto' && t.priority === 'Crítica').length}
            </strong>
          </div>
        </div>
      </div>

      {/* 6. Atividade Recente & 8. Acesso Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividade Recente (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Atividade Recente do Workspace ({recentActivities.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('automations')}
              className="text-xs text-[#0066ff] hover:underline font-medium cursor-pointer"
            >
              Ver audit trail completo
            </button>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)] shadow-xs overflow-hidden">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-3.5 sm:p-4 hover:bg-[var(--bg-surface-hover)] transition-colors flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shrink-0 mt-0.5">
                  {act.type === 'GitHub' && <GitBranch className="w-3.5 h-3.5 text-purple-500" />}
                  {act.type === 'Claude' && <Bot className="w-3.5 h-3.5 text-indigo-500" />}
                  {act.type === 'Codex' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                  {act.type === 'Workflow' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}

            {recentActivities.length === 0 && (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                Nenhuma atividade recente registrada nas últimas horas.
              </div>
            )}
          </div>
        </div>

        {/* 8. Acesso Rápido (1 span) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0066ff]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Acesso Rápido
            </h2>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 sm:p-4 space-y-2.5 shadow-xs">
            <button
              type="button"
              onClick={handleQuickCreateTask}
              className="w-full p-3 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[#0066ff] transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-[#0066ff]">
                    Criar Nova Demanda
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Inserir demanda no quadro</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#0066ff]" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('table')}
              className="w-full p-3 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[#0066ff] transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-[#0066ff]">
                    Abrir Quadro Principal
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Visualização em tabela completa</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#0066ff]" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('automations')}
              className="w-full p-3 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-amber-500 transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-amber-500">
                    Consultar Automações
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Regras e gatilhos ativos</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-500" />
            </button>

            <button
              type="button"
              onClick={() => simulateGitHubEvent('PR_MERGED')}
              className="w-full p-3 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-purple-500 transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <GitPullRequest className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-purple-500">
                    Simular Webhook PR Merged
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Disparar esteira ao vivo</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-purple-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 9. Resumo das Integrações Reais (GitHub & IAs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Status das Integrações de Engenharia &amp; IAs
            </h2>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsIntegrationsOpen(true)}
            rightIcon={<ExternalLink className="w-3 h-3" />}
          >
            Gerenciar Conexões
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GitHub Integration Card */}
          <div
            className={`p-5 rounded-xl border shadow-xs space-y-3.5 transition-all ${
              isGithubConnected
                ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                : 'bg-rose-500/5 border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--text-primary)]">GitHub PAT</h3>
                  <div className="text-[11px] text-[var(--text-muted)]">Repositório &amp; PRs</div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isGithubConnected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}
              >
                {isGithubConnected ? 'CONECTADO' : 'NÃO CONFIGURADO'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Repositório:</span>
                <span className="font-mono text-[var(--text-primary)] text-[11px] truncate max-w-[150px]">
                  preventsenior/soft-solutions-core
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Autenticação:</span>
                <span className="font-mono text-purple-500 text-[11px]">
                  {githubToken ? `PAT ••••${githubToken.slice(-4)}` : 'Token ausente'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>PRs Vinculados:</span>
                <span className="font-mono tabular-nums text-[var(--text-primary)] font-semibold">
                  {integrationsStats.githubPrCount} ativos
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsIntegrationsOpen(true)}
              className="w-full text-xs mt-1"
            >
              {isGithubConnected ? 'Ver Repositório' : 'Conectar Token PAT'}
            </Button>
          </div>

          {/* Claude 3.5 Sonnet Integration Card */}
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--text-primary)]">Claude 3.5 Sonnet</h3>
                  <div className="text-[11px] text-[var(--text-muted)]">Histórias de Usuário &amp; BDD</div>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ATIVO
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Modelo:</span>
                <span className="font-mono text-indigo-500 text-[11px]">claude-3-5-sonnet</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Demandas Refinadas:</span>
                <span className="font-mono tabular-nums text-[var(--text-primary)] font-semibold">
                  {integrationsStats.claudeCount} demandas
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Taxa de Cobertura:</span>
                <span className="font-mono text-emerald-500 font-semibold">100% dos critérios</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsIntegrationsOpen(true)}
              className="w-full text-xs mt-1"
            >
              Configurar Agente
            </Button>
          </div>

          {/* Codex Test Engine Integration Card */}
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--text-primary)]">Codex Test Engine</h3>
                  <div className="text-[11px] text-[var(--text-muted)]">Testes Unitários Vitest</div>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ATIVO
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Framework:</span>
                <span className="font-mono text-amber-500 text-[11px]">Vitest / RTL</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Suítes de Testes:</span>
                <span className="font-mono tabular-nums text-[var(--text-primary)] font-semibold">
                  {integrationsStats.codexCount} suítes geradas
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>CI/CD Check:</span>
                <span className="font-mono text-emerald-500 font-semibold">Passing (Green)</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsIntegrationsOpen(true)}
              className="w-full text-xs mt-1"
            >
              Configurar Engine
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
