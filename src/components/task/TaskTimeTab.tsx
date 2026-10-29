import React, { useState } from 'react';
import { Play, Square, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useBilling } from '../../context/BillingContext';
import { entryMinutes, formatClock, formatDuration, parseDurationInput, taskMinutes } from '../../lib/time';
import { formatBRL } from '../../lib/billing';
import { localDate } from '../../lib/dates';
import { useNow } from '../../lib/useNow';
import { Task } from '../../types';
import { Button } from '../ui/Button';

const inputClass =
  'bg-[var(--bg-canvas)] text-[var(--text-primary)] px-2 py-1 rounded-md border border-[var(--border-subtle)] text-xs outline-none focus:border-[var(--accent-primary)]';

export const TaskTimeTab: React.FC<{ task: Task }> = ({ task }) => {
  const { runningTimer, startTimer, stopTimer, addTimeEntry, deleteTimeEntry } = useProject();
  const { clients } = useBilling();

  const isRunningHere = runningTimer?.taskId === task.id;
  const now = useNow(isRunningHere);

  const [date, setDate] = useState(localDate());
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const entries = [...(task.timeEntries ?? [])].sort((a, b) => b.start.localeCompare(a.start));
  const total = taskMinutes(task, now);
  const unbilled = (task.timeEntries ?? []).filter((e) => e.end && !e.invoiceId).reduce((s, e) => s + entryMinutes(e), 0);
  const client = clients.find((c) => c.id === task.clientId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseDurationInput(duration);
    if (!minutes || minutes <= 0) {
      setError('Use formatos como 1:30, 1,5 ou 45m.');
      return;
    }
    addTimeEntry(task.id, { date, minutes, note });
    setDuration('');
    setNote('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {isRunningHere ? formatClock(entryMinutes({ id: '', start: runningTimer!.start, end: null }, now)) : formatDuration(total)}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {isRunningHere ? `Total: ${formatDuration(total)}` : 'Tempo total registrado'}
            {client && unbilled > 0 && ` · ${formatDuration(unbilled)} a faturar (${formatBRL((unbilled / 60) * client.hourlyRate)})`}
          </div>
        </div>
        {isRunningHere ? (
          <Button variant="secondary" size="sm" onClick={() => stopTimer()} leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}>
            Parar
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={() => startTimer(task.id)} leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}>
            Iniciar
          </Button>
        )}
      </div>
      {runningTimer && !isRunningHere && (
        <p className="text-xs text-amber-500">Outro cronômetro está rodando; iniciar aqui vai pará-lo.</p>
      )}

      {/* Manual entry */}
      <form onSubmit={submit} className="space-y-1.5">
        <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Lançar horas</div>
        <div className="flex flex-wrap gap-1.5">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="1:30"
            className={`${inputClass} w-20`}
            aria-label="Duração"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota (opcional)"
            className={`${inputClass} flex-1 min-w-[8rem]`}
          />
          <Button type="submit" variant="secondary" size="sm" disabled={!duration.trim()}>
            Adicionar
          </Button>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </form>

      {/* Entries */}
      {entries.length === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)]">Nenhum tempo registrado.</p>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-2 text-[13px]">
              <span className="text-[var(--text-muted)] tabular-nums w-20 shrink-0">
                {new Date(e.start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </span>
              <span className="flex-1 min-w-0 truncate text-[var(--text-secondary)]">
                {e.end === null ? <span className="text-emerald-500">Rodando…</span> : e.note || '—'}
              </span>
              {e.invoiceId && <span className="text-xs text-[var(--text-muted)] shrink-0">faturado</span>}
              <span className="tabular-nums text-[var(--text-primary)] w-16 text-right shrink-0">
                {formatDuration(entryMinutes(e, now))}
              </span>
              <button
                type="button"
                onClick={() => deleteTimeEntry(task.id, e.id)}
                disabled={Boolean(e.invoiceId) || e.end === null}
                className="p-1 text-[var(--text-muted)] hover:text-rose-500 disabled:opacity-30 disabled:hover:text-[var(--text-muted)] cursor-pointer"
                aria-label="Excluir lançamento"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
