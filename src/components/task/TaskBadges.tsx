import React from 'react';
import { Lock, Repeat, Paperclip, Timer, Github } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { describeRecurrence } from '../../lib/recurrence';
import { Task } from '../../types';

/** Compact row of tags and status hints (blocked, recurring, timer, attachments, GitHub) for a task. */
export const TaskBadges: React.FC<{ task: Task; className?: string }> = ({ task, className = '' }) => {
  const { tags, allTasks, runningTimer } = useProject();

  const taskTags = tags.filter((t) => task.tags?.includes(t.id));
  const openBlockers = (task.blockedBy ?? [])
    .map((id) => allTasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t) && t!.status !== 'Pronto');
  const isTiming = runningTimer?.taskId === task.id;
  const attachments = task.attachments?.length ?? 0;
  const links = task.githubLinks?.length ?? 0;

  if (taskTags.length === 0 && openBlockers.length === 0 && !task.recurrence && !isTiming && attachments === 0 && links === 0) {
    return null;
  }

  const icon = 'w-3 h-3 shrink-0';
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 text-[var(--text-muted)] ${className}`}>
      {isTiming && <Timer className={`${icon} text-emerald-500`} aria-label="Cronômetro rodando" />}
      {openBlockers.length > 0 && (
        <span title={`Bloqueada por: ${openBlockers.map((b) => b.title).join(', ')}`} className="inline-flex">
          <Lock className={`${icon} text-amber-500`} aria-label="Bloqueada" />
        </span>
      )}
      {task.recurrence && (
        <span title={describeRecurrence(task.recurrence)} className="inline-flex">
          <Repeat className={icon} aria-label="Recorrente" />
        </span>
      )}
      {links > 0 && <Github className={icon} aria-label={`${links} links do GitHub`} />}
      {attachments > 0 && (
        <span className="inline-flex items-center gap-0.5 text-[10px] tabular-nums">
          <Paperclip className={icon} aria-hidden="true" />
          {attachments}
        </span>
      )}
      {taskTags.map((t) => (
        <span key={t.id} className="inline-flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
          {t.name}
        </span>
      ))}
    </span>
  );
};
