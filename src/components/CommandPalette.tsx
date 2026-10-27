import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from '../types';

interface Command {
  id: string;
  label: string;
  hint?: string;
  section: 'Ações' | 'Ir para' | 'Demandas' | 'Criar';
  run: () => void;
}

const VIEWS: { id: ViewType; label: string }[] = [
  { id: 'overview', label: 'Início' },
  { id: 'table', label: 'Demandas' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'timeline', label: 'Cronograma' },
  { id: 'github', label: 'GitHub' },
  { id: 'billing', label: 'Faturamento' },
  { id: 'archive', label: 'Arquivo' },
  { id: 'automations', label: 'Automações' },
  { id: 'metrics', label: 'Métricas' },
];

/** Normalizes for accent- and case-insensitive matching */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen: isOpen,
    setIsCommandPaletteOpen: setIsOpen,
    allTasks,
    groups,
    addTask,
    setSelectedTaskId,
    setCurrentView,
    runningTimer,
    startTimer,
    stopTimer,
    toggleTheme,
    archiveCompleted,
  } = useProject();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Global shortcut: Ctrl+K / Cmd+K toggles the palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActive(0);
      // Focus after the dialog renders
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const commands = useMemo<Command[]>(() => {
    const q = norm(query.trim());
    const close = () => setIsOpen(false);

    const actions: Command[] = [
      {
        id: 'new-task',
        label: query.trim() ? `Criar demanda "${query.trim()}"` : 'Criar demanda',
        section: query.trim() ? 'Criar' : 'Ações',
        run: () => {
          const task = addTask(groups[0]?.id ?? 'group-marketing', query.trim() || undefined);
          setSelectedTaskId(task.id);
          close();
        },
      },
      ...(runningTimer
        ? [{ id: 'stop-timer', label: 'Parar cronômetro', section: 'Ações' as const, run: () => (stopTimer(), close()) }]
        : []),
      { id: 'archive-done', label: 'Arquivar demandas concluídas', section: 'Ações', run: () => (archiveCompleted(), close()) },
      { id: 'theme', label: 'Alternar tema claro/escuro', section: 'Ações', run: () => (toggleTheme(), close()) },
    ];

    const views: Command[] = VIEWS.map((v) => ({
      id: `view-${v.id}`,
      label: v.label,
      section: 'Ir para',
      run: () => (setCurrentView(v.id), close()),
    }));

    const tasks: Command[] = allTasks
      .filter((t) => !q || norm(t.title).includes(q))
      .slice(0, 30)
      .flatMap((t) => {
        const open = {
          id: `task-${t.id}`,
          label: t.title,
          hint: t.archivedAt ? 'arquivada' : t.status,
          section: 'Demandas' as const,
          run: () => (setSelectedTaskId(t.id), close()),
        };
        // Offer a direct "start timer" for an exact-ish match
        return q && runningTimer?.taskId !== t.id && !t.archivedAt
          ? [open, { ...open, id: `timer-${t.id}`, label: `Iniciar cronômetro: ${t.title}`, hint: undefined, run: () => (startTimer(t.id), close()) }]
          : [open];
      });

    const matches = (c: Command) => !q || norm(c.label).includes(q);
    const [create, ...otherActions] = actions;
    const results = [...otherActions.filter(matches), ...views.filter(matches), ...tasks];
    // With a query, matches come first and "Criar demanda" is the fallback at the end
    return q ? [...results, create] : [create, ...results];
  }, [query, allTasks, groups, runningTimer, addTask, setSelectedTaskId, setCurrentView, startTimer, stopTimer, toggleTheme, archiveCompleted, setIsOpen]);

  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, commands.length - 1)));
  }, [commands.length]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!isOpen) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % commands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + commands.length) % commands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commands[active]?.run();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  let lastSection = '';

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div
        className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-label="Paleta de comandos"
      >
        <div className="flex items-center gap-2 px-4 border-b border-[var(--border-subtle)]">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Buscar demandas, telas e ações…"
            className="flex-1 bg-transparent py-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={`cmd-${active}`}
          />
          <kbd className="text-[10px] text-[var(--text-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">esc</kbd>
        </div>

        <ul ref={listRef} id="command-list" role="listbox" className="max-h-[50vh] overflow-y-auto py-1.5">
          {commands.map((c, i) => {
            const header = c.section !== lastSection ? c.section : null;
            lastSection = c.section;
            return (
              <React.Fragment key={c.id}>
                {header && (
                  <li role="presentation" className="px-4 pt-2 pb-1 text-[11px] font-medium text-[var(--text-muted)]">
                    {header}
                  </li>
                )}
                <li
                  id={`cmd-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => c.run()}
                  className={`mx-1.5 flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] cursor-pointer ${
                    i === active ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="flex-1 min-w-0 truncate">{c.label}</span>
                  {c.hint && <span className="text-xs text-[var(--text-muted)] shrink-0">{c.hint}</span>}
                  {i === active && <CornerDownLeft className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />}
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
