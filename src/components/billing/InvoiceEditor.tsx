import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import { useProject } from '../../context/ProjectContext';
import { formatBRL, itemTotal, milestoneItem, randomId, timeItems } from '../../lib/billing';
import { addDays, localDate } from '../../lib/dates';
import { formatDuration } from '../../lib/time';
import { InvoiceItem, InvoiceStatus } from '../../types';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { fieldClass, FormField, Modal } from '../ui/Modal';

interface ManualItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const firstDayOfMonth = () => `${localDate().slice(0, 8)}01`;

const sectionTitle = 'text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider';

/**
 * Creates an invoice from three sources: unbilled hours of the client's tasks (period filter),
 * open milestones of the client's fixed-price projects, and free-form lines.
 */
export const InvoiceEditor: React.FC<{ initialClientId?: string; onClose: () => void }> = ({ initialClientId, onClose }) => {
  const { clients, projects, createInvoice } = useBilling();
  const { allTasks } = useProject();

  const [clientId, setClientId] = useState(initialClientId ?? clients[0]?.id ?? '');
  const [issueDate, setIssueDate] = useState(localDate());
  const [dueDate, setDueDate] = useState(addDays(localDate(), 15));
  const [status, setStatus] = useState<InvoiceStatus>('draft');
  const [notes, setNotes] = useState('');
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(localDate());
  const [excludedTasks, setExcludedTasks] = useState<Set<string>>(new Set());
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());
  const [manual, setManual] = useState<ManualItem[]>([]);

  const client = clients.find((c) => c.id === clientId);

  const hourItems = useMemo(() => (client ? timeItems(allTasks, client, from, to) : []), [allTasks, client, from, to]);
  const openMilestones = projects
    .filter((p) => p.clientId === clientId)
    .flatMap((p) => p.milestones.filter((m) => !m.invoiceId).map((m) => ({ project: p, milestone: m })));

  const items: InvoiceItem[] = [
    ...hourItems.filter((i) => i.source?.type === 'time' && !excludedTasks.has(i.source.taskId)),
    ...openMilestones
      .filter(({ milestone }) => selectedMilestones.has(milestone.id))
      .map(({ project, milestone }) => milestoneItem(project, milestone.id)!),
    ...manual.filter((m) => m.description.trim() && m.quantity > 0),
  ];
  const total = items.reduce((s, i) => s + itemTotal(i), 0);

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const save = () => {
    createInvoice({ clientId, issueDate, dueDate, status, notes: notes.trim() || undefined, items });
    onClose();
  };

  return (
    <Modal
      title="Nova fatura"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <span className="mr-auto text-sm tabular-nums text-[var(--text-primary)]">Total: {formatBRL(total)}</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={save} disabled={!client || items.length === 0 || dueDate < issueDate}>
            Criar fatura
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Cliente" htmlFor="inv-client">
            <select
              id="inv-client"
              className={fieldClass}
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setExcludedTasks(new Set());
                setSelectedMilestones(new Set());
              }}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Emissão" htmlFor="inv-issue">
            <input id="inv-issue" type="date" className={fieldClass} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </FormField>
          <FormField label="Vencimento" htmlFor="inv-due">
            <input id="inv-due" type="date" className={fieldClass} value={dueDate} min={issueDate} onChange={(e) => setDueDate(e.target.value)} />
          </FormField>
        </div>

        {/* Hours */}
        <section className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={sectionTitle}>Horas não faturadas</h3>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <input type="date" className={`${fieldClass} w-36 py-1`} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="De" />
              até
              <input type="date" className={`${fieldClass} w-36 py-1`} value={to} onChange={(e) => setTo(e.target.value)} aria-label="Até" />
            </div>
          </div>
          {hourItems.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">
              Nenhuma hora a faturar no período. Vincule demandas a este cliente (aba Detalhes) e registre o tempo.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
              {hourItems.map((item) => {
                const taskId = item.source?.type === 'time' ? item.source.taskId : '';
                return (
                  <li key={taskId}>
                    <label className="flex items-center gap-3 py-2 text-[13px] cursor-pointer">
                      <Checkbox
                        checked={!excludedTasks.has(taskId)}
                        onChange={() => setExcludedTasks((s) => toggle(s, taskId))}
                      />
                      <span className="flex-1 min-w-0 truncate text-[var(--text-primary)]">{item.description}</span>
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">
                        {formatDuration(item.quantity * 60)} × {formatBRL(item.unitPrice)}
                      </span>
                      <span className="tabular-nums w-24 text-right text-[var(--text-primary)]">{formatBRL(itemTotal(item))}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Milestones */}
        {openMilestones.length > 0 && (
          <section className="space-y-2">
            <h3 className={sectionTitle}>Marcos de projetos</h3>
            <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
              {openMilestones.map(({ project, milestone }) => (
                <li key={milestone.id}>
                  <label className="flex items-center gap-3 py-2 text-[13px] cursor-pointer">
                    <Checkbox
                      checked={selectedMilestones.has(milestone.id)}
                      onChange={() => setSelectedMilestones((s) => toggle(s, milestone.id))}
                    />
                    <span className="flex-1 min-w-0 truncate text-[var(--text-primary)]">
                      {project.name}: {milestone.title}
                    </span>
                    <span className="tabular-nums w-24 text-right text-[var(--text-primary)]">{formatBRL(milestone.amount)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Manual lines */}
        <section className="space-y-2">
          <h3 className={sectionTitle}>Outros itens</h3>
          {manual.map((m) => (
            <div key={m.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                className={`${fieldClass} sm:flex-1`}
                placeholder="Descrição"
                value={m.description}
                onChange={(e) => setManual((list) => list.map((x) => (x.id === m.id ? { ...x, description: e.target.value } : x)))}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                className={`${fieldClass} sm:w-20`}
                value={m.quantity}
                aria-label="Quantidade"
                onChange={(e) => setManual((list) => list.map((x) => (x.id === m.id ? { ...x, quantity: Math.max(0, Number(e.target.value) || 0) } : x)))}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                className={`${fieldClass} sm:w-32`}
                value={m.unitPrice}
                aria-label="Valor unitário"
                onChange={(e) => setManual((list) => list.map((x) => (x.id === m.id ? { ...x, unitPrice: Math.max(0, Number(e.target.value) || 0) } : x)))}
              />
              <button
                type="button"
                onClick={() => setManual((list) => list.filter((x) => x.id !== m.id))}
                className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
                aria-label="Remover item"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setManual((list) => [...list, { id: randomId(), description: '', quantity: 1, unitPrice: 0 }])}
            className="inline-flex items-center gap-1 text-xs text-[var(--accent-primary)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar item
          </button>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Situação" htmlFor="inv-status" hint="Use “Paga” para só registrar um recebimento que já aconteceu.">
            <select id="inv-status" className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviada</option>
              <option value="paid">Paga</option>
            </select>
          </FormField>
          <FormField label="Observações" htmlFor="inv-notes">
            <textarea id="inv-notes" rows={2} className={fieldClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
        </div>
      </div>
    </Modal>
  );
};
