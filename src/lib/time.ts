import { Task, TimeEntry } from '../types';

export const entryMinutes = (entry: TimeEntry, now = Date.now()) => {
  const end = entry.end ? new Date(entry.end).getTime() : now;
  return Math.max(0, (end - new Date(entry.start).getTime()) / 60000);
};

export const taskMinutes = (task: Task, now = Date.now()) =>
  (task.timeEntries ?? []).reduce((sum, e) => sum + entryMinutes(e, now), 0);

/** 95 -> "1h 35min", 30 -> "30min", 0 -> "0min" */
export const formatDuration = (minutes: number) => {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
};

/** 00:12:05 style clock for a running timer */
export const formatClock = (minutes: number) => {
  const totalSeconds = Math.floor(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
};

/** The single running timer across all tasks, if any */
export const findRunningEntry = (tasks: Task[]) => {
  for (const task of tasks) {
    const entry = task.timeEntries?.find((e) => e.end === null);
    if (entry) return { task, entry };
  }
  return null;
};

/** Parses "1:30", "1,5", "1.5" or "90m" into minutes; null if invalid. */
export const parseDurationInput = (input: string): number | null => {
  const v = input.trim().toLowerCase().replace(',', '.');
  if (!v) return null;
  const hm = v.match(/^(\d+):([0-5]?\d)$/);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  const min = v.match(/^(\d+(?:\.\d+)?)\s*m(in)?$/);
  if (min) return Number(min[1]);
  const hours = v.match(/^(\d+(?:\.\d+)?)\s*h?$/);
  if (hours) return Number(hours[1]) * 60;
  return null;
};
