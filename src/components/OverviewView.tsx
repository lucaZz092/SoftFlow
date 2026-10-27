import React, { useMemo } from 'react';
import { Check, Plus, ArrowRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { PRIORITY_STYLES } from '../styles/designSystem';
import { Button } from './ui/Button';
import { TaskStatus } from '../types';

// Reference current date in local system
const TODAY = '2026-10-22';
const TOMORROW = '2026-10-23';

const IN_PROGRESS_STATUSES: TaskStatus[] = ['Em andamento', 'Trabalhando nisso', 'Em Revisão'];

export const OverviewView: React.FC = () => {
  const {
    tasks,
    groups,
    setCurrentView,
    setSelectedTaskId,
    addTask,
    changeTaskStatus,
    setFilterStatus,
  } = useProject();

  // Contextual greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const metrics = useMemo(() => {
    const open = tasks.filter((t) => t.status !== 'Pronto');
    return {
      pending: tasks.filter((t) => t.status === 'A Fazer').length,
      inProgress: tasks.filter((t) => IN_PROGRESS_STATUSES.includes(t.status)).length,
      completed: tasks.length - open.length,
      overdue: open.filter((t) => t.dueDate < TODAY).length,
    };
  }, [tasks]);

  // Priority list: assigned to the user, urgent, or due soon
  const priorityTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === 'Pronto') return false;
        const isAssignedToUser = t.assignee?.id === 'user-1';
        const isUrgent = t.priority === 'Crítica' || t.priority === 'Alta';
        return isAssignedToUser || isUrgent || t.dueDate <= TOMORROW;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 6);
  }, [tasks]);

  const projects = useMemo(() => {
    return groups.map((g) => {
      const groupTasks = tasks.filter((t) => t.groupId === g.id);
      const done = groupTasks.filter((t) => t.status === 'Pronto').length;
      return {
        id: g.id,
        title: g.title,
        color: g.color,
        done,
        total: groupTasks.length,
        progress: groupTasks.length > 0 ? Math.round((done / groupTasks.length) * 100) : 0,
      };
    });
  }, [groups, tasks]);

  const handleQuickCreateTask = () => {
    const targetGroup = groups[0] || { id: 'group-marketing' };
    const newTask = addTask(targetGroup.id, 'Nova demanda');
    setSelectedTaskId(newTask.id);
  };

  const openTableFiltered = (status: TaskStatus | null) => {
    setFilterStatus(status);
    setCurrentView('table');
  };

  const stats: { label: string; value: number; status: TaskStatus | null; alert?: boolean }[] = [
    { label: 'A fazer', value: metrics.pending, status: 'A Fazer' },
    { label: 'Em andamento', value: metrics.inProgress, status: 'Em andamento' },
    { label: 'Concluídas', value: metrics.completed, status: 'Pronto' },
    { label: 'Atrasadas', value: metrics.overdue, status: null, alert: metrics.overdue > 0 },
  ];

  const formatDue = (dueDate: string) => {
    if (dueDate < TODAY) return { text: 'Atrasada', className: 'text-rose-500' };
    if (dueDate === TODAY) return { text: 'Hoje', className: 'text-amber-500' };
    if (dueDate === TOMORROW) return { text: 'Amanhã', className: 'text-[var(--text-secondary)]' };
    const [, month, day] = dueDate.split('-');
    return { text: `${day}/${month}`, className: 'text-[var(--text-muted)]' };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Greeting */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-[var(--text-muted)]">Quinta-feira, 22 de outubro</p>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] mt-1">
              {greeting}, Lucas
            </h2>
          </div>
          <Button variant="primary" size="sm" onClick={handleQuickCreateTask} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Nova demanda
          </Button>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => openTableFiltered(s.status)}
              className="bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] px-5 py-4 text-left transition-colors cursor-pointer"
            >
              <div className="text-[13px] text-[var(--text-muted)]">{s.label}</div>
              <div
                className={`text-2xl font-semibold tabular-nums mt-1 ${
                  s.alert ? 'text-rose-500' : 'text-[var(--text-primary)]'
                }`}
              >
                {s.value}
              </div>
            </button>
          ))}
        </section>

        {/* Priorities */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Prioridades</h3>
            <button
              type="button"
              onClick={() => openTableFiltered(null)}
              className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {priorityTasks.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">Nada urgente por aqui.</p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
              {priorityTasks.map((task) => {
                const due = formatDue(task.dueDate);
                const priorityDot = (PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Média']).dot;
                return (
                  <li key={task.id} className="flex items-center gap-3 py-2.5 group">
                    <button
                      type="button"
                      onClick={() => changeTaskStatus(task.id, 'Pronto')}
                      className="w-4 h-4 rounded-full border border-[var(--border-strong)] hover:border-[var(--accent-primary)] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      title="Marcar como concluída"
                      aria-label={`Concluir ${task.title}`}
                    >
                      <Check className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className="flex-1 min-w-0 text-left text-[13px] text-[var(--text-primary)] truncate cursor-pointer hover:underline underline-offset-2"
                    >
                      {task.title}
                    </button>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot}`}
                      title={`Prioridade ${task.priority}`}
                    />
                    <span className={`text-xs tabular-nums w-16 text-right shrink-0 ${due.className}`}>{due.text}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Projects */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Projetos</h3>
          <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setCurrentView('table')}
                  className="w-full flex items-center gap-4 py-3 text-left cursor-pointer group"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="flex-1 min-w-0 text-[13px] text-[var(--text-primary)] truncate group-hover:underline underline-offset-2">
                    {p.title}
                  </span>
                  <span className="hidden sm:block w-32 h-1 rounded-full bg-[var(--bg-surface-active)] overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-[var(--text-secondary)]"
                      style={{ width: `${p.progress}%` }}
                    />
                  </span>
                  <span className="text-xs tabular-nums text-[var(--text-muted)] w-12 text-right shrink-0">
                    {p.done}/{p.total}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
