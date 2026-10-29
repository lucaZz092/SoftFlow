import React from 'react';
import { Menu, Search, Square } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { entryMinutes, formatClock } from '../lib/time';
import { useNow } from '../lib/useNow';

const VIEW_LABELS: Record<string, string> = {
  overview: 'Início',
  table: 'Demandas',
  kanban: 'Kanban',
  timeline: 'Cronograma',
  github: 'GitHub',
  billing: 'Faturamento',
  archive: 'Arquivo',
  automations: 'Automações',
  metrics: 'Métricas',
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Running timer, visible from every screen */
const TimerPill: React.FC = () => {
  const { runningTimer, stopTimer, allTasks, setSelectedTaskId } = useProject();
  const now = useNow(Boolean(runningTimer));
  if (!runningTimer) return null;
  const task = allTasks.find((t) => t.id === runningTimer.taskId);
  const elapsed = entryMinutes({ id: '', start: runningTimer.start, end: null }, now);

  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] pl-2.5 pr-1 py-1 min-w-0">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <button
        type="button"
        onClick={() => task && setSelectedTaskId(task.id)}
        className="hidden sm:block max-w-[12rem] truncate text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        {task?.title}
      </button>
      <span className="text-[13px] tabular-nums text-[var(--text-primary)] px-1">{formatClock(elapsed)}</span>
      <button
        type="button"
        onClick={() => stopTimer()}
        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
        title="Parar cronômetro"
        aria-label="Parar cronômetro"
      >
        <Square className="w-3 h-3 fill-current" />
      </button>
    </div>
  );
};

export const TopBar: React.FC = () => {
  const { currentView, isMobileSidebarOpen, setIsMobileSidebarOpen, setIsCommandPaletteOpen } = useProject();

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden -ml-1 p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-medium text-[var(--text-primary)] truncate">
          {VIEW_LABELS[currentView] || 'Início'}
        </h1>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <TimerPill />
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
          aria-label="Abrir busca e comandos"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Buscar</span>
          <kbd className="hidden sm:inline text-[10px] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
      </div>
    </header>
  );
};
