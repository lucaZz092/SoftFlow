import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Lock, AlertCircle, Check, X, Circle } from 'lucide-react';
import { api } from '../lib/api';
import { useProject } from '../context/ProjectContext';
import type { CheckState, GithubOverview, GithubPullRequest } from '../types/github';

const relativeTime = (iso: string | null) => {
  if (!iso) return '';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days} d`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const ChecksIcon: React.FC<{ state: CheckState }> = ({ state }) => {
  if (state === 'SUCCESS') return <Check className="w-3.5 h-3.5 text-emerald-500" aria-label="CI passou" />;
  if (state === 'FAILURE' || state === 'ERROR') return <X className="w-3.5 h-3.5 text-rose-500" aria-label="CI falhou" />;
  if (state === 'PENDING' || state === 'EXPECTED') return <Circle className="w-3 h-3 text-amber-500" aria-label="CI em andamento" />;
  return <span className="w-3.5" />;
};

const REVIEW_LABEL: Record<string, { text: string; className: string }> = {
  APPROVED: { text: 'Aprovado', className: 'text-emerald-500' },
  CHANGES_REQUESTED: { text: 'Alterações pedidas', className: 'text-rose-500' },
  REVIEW_REQUIRED: { text: 'Aguardando revisão', className: 'text-[var(--text-muted)]' },
};

const Section: React.FC<{ title: string; count?: number; children: React.ReactNode }> = ({ title, count, children }) => (
  <section>
    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
      {title}
      {count !== undefined && <span className="ml-1.5 text-[var(--text-muted)] font-normal tabular-nums">{count}</span>}
    </h3>
    {children}
  </section>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="py-4 text-[13px] text-[var(--text-muted)] border-y border-[var(--border-subtle)]">{children}</p>
);

const rowLink = 'flex items-center gap-3 py-2.5 group min-w-0';
const listClass = 'divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]';

const PullRequestList: React.FC<{ items: GithubPullRequest[]; showAuthor?: boolean; empty: string }> = ({
  items,
  showAuthor,
  empty,
}) =>
  items.length === 0 ? (
    <Empty>{empty}</Empty>
  ) : (
    <ul className={listClass}>
      {items.map((pr) => {
        const review = pr.reviewDecision ? REVIEW_LABEL[pr.reviewDecision] : null;
        return (
          <li key={pr.url}>
            <a href={pr.url} target="_blank" rel="noreferrer" className={rowLink}>
              <ChecksIcon state={pr.checks} />
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] text-[var(--text-primary)] truncate group-hover:underline underline-offset-2">
                  {pr.isDraft && <span className="text-[var(--text-muted)]">Rascunho · </span>}
                  {pr.title}
                </span>
                <span className="block text-xs text-[var(--text-muted)] truncate">
                  {pr.repo} #{pr.number}
                  {showAuthor && ` · ${pr.author}`}
                </span>
              </span>
              {review && <span className={`hidden sm:block text-xs shrink-0 ${review.className}`}>{review.text}</span>}
              <span className="text-xs text-[var(--text-muted)] tabular-nums w-16 text-right shrink-0">
                {relativeTime(pr.updatedAt)}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );

export const GithubView: React.FC = () => {
  const { setIsIntegrationsOpen } = useProject();
  const [data, setData] = useState<GithubOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await api.get<GithubOverview>('/api/github/overview'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o GitHub.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Header */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {data && <img src={data.viewer.avatarUrl} alt="" className="w-9 h-9 rounded-full shrink-0" />}
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] truncate">
                {data ? data.viewer.name || data.viewer.login : 'GitHub'}
              </h2>
              {data && (
                <a
                  href={data.viewer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  @{data.viewer.login}
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {data ? `Atualizado ${relativeTime(data.fetchedAt)}` : 'Atualizar'}
          </button>
        </section>

        {error && (
          <div className="flex items-start gap-2 text-[13px] text-rose-500">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {error}{' '}
              <button type="button" onClick={() => setIsIntegrationsOpen(true)} className="underline cursor-pointer">
                Ver integrações
              </button>
            </span>
          </div>
        )}

        {!data && isLoading && <p className="text-[13px] text-[var(--text-muted)]">Carregando…</p>}

        {data && (
          <>
            <Section title="Aguardando sua revisão" count={data.reviewRequests.length}>
              <PullRequestList items={data.reviewRequests} showAuthor empty="Nenhum PR aguardando você." />
            </Section>

            <Section title="Seus PRs abertos" count={data.authoredPullRequests.length}>
              <PullRequestList items={data.authoredPullRequests} empty="Você não tem PRs abertos." />
            </Section>

            <Section title="Issues atribuídas" count={data.assignedIssues.length}>
              {data.assignedIssues.length === 0 ? (
                <Empty>Nenhuma issue atribuída a você.</Empty>
              ) : (
                <ul className={listClass}>
                  {data.assignedIssues.map((issue) => (
                    <li key={issue.url}>
                      <a href={issue.url} target="_blank" rel="noreferrer" className={rowLink}>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] text-[var(--text-primary)] truncate group-hover:underline underline-offset-2">
                            {issue.title}
                          </span>
                          <span className="block text-xs text-[var(--text-muted)] truncate">
                            {issue.repo} #{issue.number}
                          </span>
                        </span>
                        <span className="hidden sm:flex gap-1 shrink-0">
                          {issue.labels.slice(0, 2).map((l) => (
                            <span
                              key={l.name}
                              className="px-1.5 py-0.5 rounded text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                            >
                              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ backgroundColor: `#${l.color}` }} />
                              {l.name}
                            </span>
                          ))}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] tabular-nums w-16 text-right shrink-0">
                          {relativeTime(issue.updatedAt)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Atividade recente">
              {data.activity.length === 0 ? (
                <Empty>Sem atividade recente.</Empty>
              ) : (
                <ul className={listClass}>
                  {data.activity.map((a) => (
                    <li key={a.id}>
                      <a href={a.url ?? undefined} target="_blank" rel="noreferrer" className={rowLink}>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] text-[var(--text-primary)] truncate group-hover:underline underline-offset-2">
                            {a.summary}
                          </span>
                          <span className="block text-xs text-[var(--text-muted)] truncate">{a.repo}</span>
                        </span>
                        <span className="text-xs text-[var(--text-muted)] tabular-nums w-16 text-right shrink-0">
                          {relativeTime(a.createdAt)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Repositórios">
              <ul className={listClass}>
                {data.repos.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noreferrer" className={rowLink}>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 text-[13px] text-[var(--text-primary)] min-w-0">
                          <span className="truncate group-hover:underline underline-offset-2">{r.name}</span>
                          {r.isPrivate && <Lock className="w-3 h-3 text-[var(--text-muted)] shrink-0" aria-label="Privado" />}
                        </span>
                        {r.description && (
                          <span className="block text-xs text-[var(--text-muted)] truncate">{r.description}</span>
                        )}
                      </span>
                      {r.language && (
                        <span className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)] shrink-0">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.language.color ?? 'var(--text-muted)' }} />
                          {r.language.name}
                        </span>
                      )}
                      <span className="hidden sm:block text-xs text-[var(--text-muted)] tabular-nums shrink-0 w-28 text-right">
                        {r.openPullRequests} PRs · {r.openIssues} issues
                      </span>
                      <span className="text-xs text-[var(--text-muted)] tabular-nums w-16 text-right shrink-0">
                        {relativeTime(r.pushedAt)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};
