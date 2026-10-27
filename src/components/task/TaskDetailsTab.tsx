import React, { useEffect, useState } from 'react';
import { Check, Circle, ExternalLink, GitMerge, GitPullRequest, CircleDot, X, Link2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useBilling } from '../../context/BillingContext';
import { api } from '../../lib/api';
import { describeRecurrence } from '../../lib/recurrence';
import { Recurrence, Task } from '../../types';
import type { GithubLinkStatus } from '../../types/github';
import { TagPicker } from './TagPicker';

const fieldLabel = 'text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider';
const selectClass =
  'bg-[var(--bg-canvas)] text-[var(--text-primary)] px-2 py-1 rounded-md border border-[var(--border-subtle)] text-xs outline-none focus:border-[var(--accent-primary)]';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <div className={fieldLabel}>{label}</div>
    {children}
  </div>
);

const LinkStateIcon: React.FC<{ status?: GithubLinkStatus; kind: 'pull' | 'issue' }> = ({ status, kind }) => {
  if (kind === 'issue') {
    const closed = status?.state === 'CLOSED';
    return <CircleDot className={`w-3.5 h-3.5 shrink-0 ${closed ? 'text-purple-500' : 'text-emerald-500'}`} />;
  }
  if (status?.state === 'MERGED') return <GitMerge className="w-3.5 h-3.5 shrink-0 text-purple-500" />;
  return (
    <GitPullRequest
      className={`w-3.5 h-3.5 shrink-0 ${
        status?.state === 'CLOSED' ? 'text-rose-500' : status?.isDraft ? 'text-[var(--text-muted)]' : 'text-emerald-500'
      }`}
    />
  );
};

const STATE_LABEL: Record<string, string> = { OPEN: 'Aberto', CLOSED: 'Fechado', MERGED: 'Mesclado' };

/** Description plus the task's planning properties: tags, client, recurrence, dependencies and GitHub links. */
export const TaskDetailsTab: React.FC<{ task: Task }> = ({ task }) => {
  const { allTasks, updateTask, setRecurrence, addBlocker, removeBlocker, addGithubLink, removeGithubLink, setSelectedTaskId } =
    useProject();
  const { clients } = useBilling();

  const [linkInput, setLinkInput] = useState('');
  const [linkStatuses, setLinkStatuses] = useState<Record<string, GithubLinkStatus>>({});
  const [linkError, setLinkError] = useState<string | null>(null);

  const links = task.githubLinks ?? [];
  const linksKey = links.join('|');

  useEffect(() => {
    if (links.length === 0) return;
    let cancelled = false;
    setLinkError(null);
    api
      .post<{ links: GithubLinkStatus[] }>('/api/github/links', { urls: links })
      .then(({ links: result }) => {
        if (!cancelled) setLinkStatuses(Object.fromEntries(result.map((l) => [l.url, l])));
      })
      .catch((err) => !cancelled && setLinkError(err instanceof Error ? err.message : 'Falha ao consultar o GitHub.'));
    return () => {
      cancelled = true;
    };
    // linksKey captures the list contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linksKey]);

  const blockers = (task.blockedBy ?? []).map((id) => allTasks.find((t) => t.id === id)).filter((t): t is Task => Boolean(t));
  const blocking = allTasks.filter((t) => t.blockedBy?.includes(task.id));
  const candidates = allTasks.filter((t) => t.id !== task.id && !t.archivedAt && !task.blockedBy?.includes(t.id));

  const recurrence = task.recurrence;
  const updateRecurrence = (next: Partial<Recurrence> | null) => {
    if (next === null) setRecurrence(task.id, undefined);
    else setRecurrence(task.id, { frequency: 'weekly', interval: 1, ...recurrence, ...next });
  };

  const submitLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (addGithubLink(task.id, linkInput)) setLinkInput('');
  };

  return (
    <div className="space-y-6">
      <Field label="Descrição">
        <textarea
          rows={3}
          value={task.description}
          onChange={(e) => updateTask(task.id, { description: e.target.value })}
          className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-md px-2.5 py-2 text-[13px] text-[var(--text-primary)] outline-none resize-y leading-relaxed focus:border-[var(--accent-primary)]"
          placeholder="Contexto, objetivo, critérios…"
        />
      </Field>

      <Field label="Etiquetas">
        <TagPicker task={task} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Cliente (faturamento)">
          <select
            value={task.clientId ?? ''}
            onChange={(e) => updateTask(task.id, { clientId: e.target.value || undefined })}
            className={`${selectClass} w-full`}
          >
            <option value="">Interno (não faturável)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Recorrência">
          <div className="flex items-center gap-1.5">
            <select
              value={recurrence?.frequency ?? ''}
              onChange={(e) =>
                updateRecurrence(e.target.value ? { frequency: e.target.value as Recurrence['frequency'] } : null)
              }
              className={selectClass}
            >
              <option value="">Não repete</option>
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
            {recurrence && (
              <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                a cada
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={recurrence.interval}
                  onChange={(e) => updateRecurrence({ interval: Math.max(1, Number(e.target.value) || 1) })}
                  className={`${selectClass} w-14`}
                />
              </label>
            )}
          </div>
          {recurrence && (
            <p className="text-xs text-[var(--text-muted)]">
              {describeRecurrence(recurrence)}. Ao concluir, a próxima é criada automaticamente.
            </p>
          )}
        </Field>
      </div>

      <Field label="Bloqueada por">
        <div className="space-y-1.5">
          {blockers.map((b) => (
            <div key={b.id} className="flex items-center gap-2 text-[13px]">
              {b.status === 'Pronto' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => setSelectedTaskId(b.id)}
                className={`flex-1 min-w-0 text-left truncate hover:underline cursor-pointer ${
                  b.status === 'Pronto' ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'
                }`}
              >
                {b.title}
              </button>
              <button
                type="button"
                onClick={() => removeBlocker(task.id, b.id)}
                className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label={`Remover dependência ${b.title}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <select
            value=""
            onChange={(e) => e.target.value && addBlocker(task.id, e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="">Adicionar dependência…</option>
            {candidates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          {blocking.length > 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              Esta demanda bloqueia: {blocking.map((t) => t.title).join(', ')}
            </p>
          )}
        </div>
      </Field>

      <Field label="GitHub">
        <div className="space-y-1.5">
          {links.map((url) => {
            const status = linkStatuses[url];
            const kind = url.includes('/pull/') ? 'pull' : 'issue';
            return (
              <div key={url} className="flex items-center gap-2 text-[13px] min-w-0">
                <LinkStateIcon status={status} kind={kind} />
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-0 truncate text-[var(--text-primary)] hover:underline"
                  title={status?.error}
                >
                  {status && !status.error ? status.title : url.replace('https://github.com/', '')}
                </a>
                {status && !status.error && (
                  <span className="hidden sm:inline text-xs text-[var(--text-muted)] shrink-0">
                    {status.isDraft ? 'Rascunho' : STATE_LABEL[status.state]}
                    {status.checks === 'SUCCESS' && ' · CI ok'}
                    {(status.checks === 'FAILURE' || status.checks === 'ERROR') && ' · CI falhou'}
                    {status.checks === 'PENDING' && ' · CI rodando'}
                  </span>
                )}
                {status?.error && <span className="text-xs text-amber-500 shrink-0">sem acesso</span>}
                <a href={url} target="_blank" rel="noreferrer" className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => removeGithubLink(task.id, url)}
                  className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remover link"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {linkError && <p className="text-xs text-amber-500">{linkError}</p>}
          <form onSubmit={submitLink} className="flex gap-1.5">
            <div className="relative flex-1 min-w-0">
              <Link2 className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Link de um PR ou issue"
                className={`${selectClass} w-full pl-7`}
              />
            </div>
            <button type="submit" className="px-2.5 text-xs text-[var(--accent-primary)] cursor-pointer disabled:opacity-40" disabled={!linkInput.trim()}>
              Vincular
            </button>
          </form>
        </div>
      </Field>
    </div>
  );
};
