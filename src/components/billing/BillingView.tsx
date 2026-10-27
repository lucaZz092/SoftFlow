import React, { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import { useProject } from '../../context/ProjectContext';
import { billingSummary, formatBRL, monthlyRevenue, unbilledTime } from '../../lib/billing';
import { localDate } from '../../lib/dates';
import { formatDuration } from '../../lib/time';
import { Button } from '../ui/Button';
import { ClientsPanel } from './ClientsPanel';
import { InvoiceEditor } from './InvoiceEditor';
import { InvoicesPanel } from './InvoicesPanel';
import { ProjectsPanel } from './ProjectsPanel';

type Tab = 'summary' | 'invoices' | 'clients' | 'projects';
const TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: 'Resumo' },
  { id: 'invoices', label: 'Faturas' },
  { id: 'clients', label: 'Clientes' },
  { id: 'projects', label: 'Projetos' },
];

const MONTH_FMT = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

const Summary: React.FC<{ onInvoiceClient: (clientId: string) => void }> = ({ onInvoiceClient }) => {
  const { invoices, clients, projects } = useBilling();
  const { allTasks } = useProject();
  const today = localDate();

  const summary = billingSummary(invoices, today);
  const months = monthlyRevenue(invoices, today, 6);
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  const unbilledByClient = useMemo(
    () =>
      clients
        .map((c) => {
          const minutes = unbilledTime(allTasks, c.id).reduce((s, r) => s + r.minutes, 0);
          const milestones = projects
            .filter((p) => p.clientId === c.id)
            .flatMap((p) => p.milestones.filter((m) => !m.invoiceId));
          return {
            client: c,
            minutes,
            value: (minutes / 60) * c.hourlyRate + milestones.reduce((s, m) => s + m.amount, 0),
            milestoneCount: milestones.length,
          };
        })
        .filter((r) => r.value > 0),
    [clients, projects, allTasks]
  );
  const unbilledTotal = unbilledByClient.reduce((s, r) => s + r.value, 0);

  const stats = [
    { label: 'Recebido no mês', value: summary.receivedThisMonth },
    { label: 'A receber', value: summary.receivable },
    { label: 'Vencido', value: summary.overdue, alert: summary.overdue > 0 },
    { label: 'A faturar', value: unbilledTotal },
  ];

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--bg-canvas)] px-5 py-4">
            <div className="text-[13px] text-[var(--text-muted)]">{s.label}</div>
            <div className={`text-xl font-semibold tabular-nums mt-1 ${s.alert ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
              {formatBRL(s.value)}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Recebido por mês</h3>
        <div className="flex items-end gap-3 h-36" role="img" aria-label="Receita recebida nos últimos 6 meses">
          {months.map((m) => {
            const [y, mo] = m.month.split('-').map(Number);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end" title={`${m.month}: ${formatBRL(m.total)}`}>
                <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
                  {m.total > 0 ? formatBRL(m.total).replace(/,\d\d$/, '') : ''}
                </span>
                <div
                  className="w-full max-w-12 rounded-t bg-[var(--text-secondary)] opacity-80"
                  style={{ height: `${Math.max(m.total > 0 ? 4 : 1, (m.total / maxMonth) * 100)}%` }}
                />
                <span className="text-[11px] text-[var(--text-muted)] capitalize">
                  {MONTH_FMT.format(new Date(y, mo - 1, 1)).replace('.', '')}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">A faturar por cliente</h3>
        {unbilledByClient.length === 0 ? (
          <p className="py-4 text-[13px] text-[var(--text-muted)] border-y border-[var(--border-subtle)]">
            Nada pendente. Horas registradas em demandas vinculadas a um cliente aparecem aqui.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {unbilledByClient.map((r) => (
              <li key={r.client.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[var(--text-primary)] truncate">{r.client.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {[r.minutes > 0 && `${formatDuration(r.minutes)} de trabalho`, r.milestoneCount > 0 && `${r.milestoneCount} marcos`]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <span className="text-[13px] tabular-nums text-[var(--text-primary)]">{formatBRL(r.value)}</span>
                <Button variant="secondary" size="xs" onClick={() => onInvoiceClient(r.client.id)}>
                  Faturar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export const BillingView: React.FC = () => {
  const { isLoaded, error } = useBilling();
  const [tab, setTab] = useState<Tab>('summary');
  const [editor, setEditor] = useState<{ clientId?: string } | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Faturamento</h2>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">Horas trabalhadas, projetos de valor fechado e recebimentos.</p>
        </section>

        <div className="flex gap-1 border-b border-[var(--border-subtle)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-2.5 pb-2.5 text-[13px] border-b-2 -mb-px cursor-pointer transition-colors ${
                tab === t.id
                  ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-rose-500">Erro ao sincronizar: {error}</p>}

        {!isLoaded ? (
          <div className="flex justify-center py-12 text-[var(--text-muted)]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'summary' && <Summary onInvoiceClient={(clientId) => setEditor({ clientId })} />}
            {tab === 'invoices' && <InvoicesPanel onNewInvoice={() => setEditor({})} />}
            {tab === 'clients' && <ClientsPanel />}
            {tab === 'projects' && <ProjectsPanel />}
          </>
        )}
      </div>

      {editor && <InvoiceEditor initialClientId={editor.clientId} onClose={() => setEditor(null)} />}
    </div>
  );
};
