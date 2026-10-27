import { Recurrence, Task } from '../types';
import { addDays, addMonths } from './dates';

export const RECURRENCE_LABELS: Record<Recurrence['frequency'], [string, string]> = {
  daily: ['dia', 'dias'],
  weekly: ['semana', 'semanas'],
  monthly: ['mês', 'meses'],
};

export const describeRecurrence = (r: Recurrence) => {
  const [one, many] = RECURRENCE_LABELS[r.frequency];
  return r.interval === 1 ? `Repete a cada ${one}` : `Repete a cada ${r.interval} ${many}`;
};

export const shiftDate = (iso: string, r: Recurrence) => {
  const n = Math.max(1, Math.floor(r.interval));
  if (r.frequency === 'daily') return addDays(iso, n);
  if (r.frequency === 'weekly') return addDays(iso, 7 * n);
  return addMonths(iso, n);
};

/**
 * The next occurrence of a recurring task: same content, dates moved forward by one period,
 * progress reset (status, subtasks, time, comments, attachments).
 */
export function nextOccurrence(task: Task, newId: string, now = new Date()): Task {
  if (!task.recurrence) throw new Error('Task is not recurring');
  const r = task.recurrence;
  const iso = now.toISOString();
  return {
    ...task,
    id: newId,
    status: 'A Fazer',
    dueDate: shiftDate(task.dueDate, r),
    timeline: { start: shiftDate(task.timeline.start, r), end: shiftDate(task.timeline.end, r) },
    subtasks: task.subtasks.map((s) => ({ ...s, completed: false })),
    comments: [],
    timeEntries: [],
    attachments: [],
    archivedAt: undefined,
    createdAt: iso,
    updatedAt: iso,
  };
}
