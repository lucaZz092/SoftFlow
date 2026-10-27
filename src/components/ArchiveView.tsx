import React, { useMemo, useState } from 'react';
import { ArchiveRestore, Trash2, Search } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Button } from './ui/Button';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const ArchiveView: React.FC = () => {
  const { archivedTasks, groups, unarchiveTask, deleteTask, setSelectedTaskId, archiveCompleted, tasks } = useProject();
  const [query, setQuery] = useState('');

  const list = useMemo(
    () =>
      archivedTasks
        .filter((t) => !query || norm(t.title).includes(norm(query)))
        .sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? '')),
    [archivedTasks, query]
  );

  const doneOnBoard = tasks.filter((t) => t.status === 'Pronto').length;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Arquivo</h2>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">
              Demandas fora do quadro. Nada aqui é apagado até você excluir.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={archiveCompleted} disabled={doneOnBoard === 0}>
            Arquivar {doneOnBoard > 0 ? `${doneOnBoard} concluídas` : 'concluídas'}
          </Button>
        </section>

        <div className="relative max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar no arquivo"
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-md pl-8 pr-2.5 py-1.5 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
          />
        </div>

        {list.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
            {archivedTasks.length === 0 ? 'O arquivo está vazio.' : 'Nada encontrado.'}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {list.map((t) => {
              const group = groups.find((g) => g.id === t.groupId);
              return (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskId(t.id)}
                    className="flex-1 min-w-0 text-left cursor-pointer group"
                  >
                    <span className="block text-[13px] text-[var(--text-primary)] truncate group-hover:underline underline-offset-2">
                      {t.title}
                    </span>
                    <span className="block text-xs text-[var(--text-muted)] truncate">
                      {group?.title ?? 'Sem grupo'} · {t.status} · arquivada em{' '}
                      {t.archivedAt ? new Date(t.archivedAt).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => unarchiveTask(t.id)}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                    title="Restaurar"
                    aria-label={`Restaurar ${t.title}`}
                  >
                    <ArchiveRestore className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                    title="Excluir"
                    aria-label={`Excluir ${t.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
