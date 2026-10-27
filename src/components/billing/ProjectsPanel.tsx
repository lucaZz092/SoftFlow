import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import { formatBRL, randomId } from '../../lib/billing';
import { formatDateBR } from '../../lib/dates';
import { BillingProject, Milestone } from '../../types';
import { Button } from '../ui/Button';
import { fieldClass, FormField, Modal } from '../ui/Modal';

type ProjectDraft = Omit<BillingProject, 'id' | 'createdAt'>;

const ProjectForm: React.FC<{
  initial: ProjectDraft;
  title: string;
  onSave: (p: ProjectDraft) => void;
  onClose: () => void;
}> = ({ initial, title, onSave, onClose }) => {
  const { clients } = useBilling();
  const [draft, setDraft] = useState(initial);
  const set = (patch: Partial<ProjectDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const setMilestone = (id: string, patch: Partial<Milestone>) =>
    set({ milestones: draft.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) });

  const milestonesTotal = draft.milestones.reduce((s, m) => s + m.amount, 0);
  const mismatch = draft.milestones.length > 0 && Math.abs(milestonesTotal - draft.totalValue) > 0.009;
  const valid = draft.name.trim() && draft.clientId && draft.totalValue > 0 && draft.milestones.every((m) => m.title.trim() && m.amount > 0);

  return (
    <Modal
      title={title}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" disabled={!valid} onClick={() => onSave({ ...draft, name: draft.name.trim() })}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Nome do projeto" htmlFor="proj-name">
            <input id="proj-name" className={fieldClass} value={draft.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
          </FormField>
          <FormField label="Cliente" htmlFor="proj-client">
            <select id="proj-client" className={fieldClass} value={draft.clientId} onChange={(e) => set({ clientId: e.target.value })}>
              <option value="">Selecione…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Valor total (R$)" htmlFor="proj-total">
          <input
            id="proj-total"
            type="number"
            min={0}
            step="0.01"
            className={fieldClass}
            value={draft.totalValue}
            onChange={(e) => set({ totalValue: Math.max(0, Number(e.target.value) || 0) })}
          />
        </FormField>

        <div className="space-y-2">
          <div className="text-xs text-[var(--text-muted)]">Marcos de cobrança</div>
          {draft.milestones.map((m) => {
            const locked = Boolean(m.invoiceId);
            return (
              <div key={m.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <input
                  className={`${fieldClass} sm:flex-1`}
                  placeholder="Ex.: Entrada, Entrega do MVP"
                  value={m.title}
                  disabled={locked}
                  onChange={(e) => setMilestone(m.id, { title: e.target.value })}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={`${fieldClass} sm:w-32`}
                  value={m.amount}
                  disabled={locked}
                  onChange={(e) => setMilestone(m.id, { amount: Math.max(0, Number(e.target.value) || 0) })}
                  aria-label="Valor do marco"
                />
                <input
                  type="date"
                  className={`${fieldClass} sm:w-40`}
                  value={m.dueDate ?? ''}
                  disabled={locked}
                  onChange={(e) => setMilestone(m.id, { dueDate: e.target.value || undefined })}
                  aria-label="Data prevista"
                />
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => set({ milestones: draft.milestones.filter((x) => x.id !== m.id) })}
                  className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                  aria-label="Remover marco"
                  title={locked ? 'Marco já faturado' : 'Remover'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                set({
                  milestones: [
                    ...draft.milestones,
                    { id: randomId(), title: '', amount: Math.max(0, draft.totalValue - milestonesTotal) },
                  ],
                })
              }
              className="inline-flex items-center gap-1 text-xs text-[var(--accent-primary)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar marco
            </button>
            {draft.milestones.length > 0 && (
              <span className={`text-xs tabular-nums ${mismatch ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                Soma dos marcos: {formatBRL(milestonesTotal)}
                {mismatch && ` (difere do total)`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const ProjectsPanel: React.FC = () => {
  const { projects, clients, invoices, addProject, updateProject, deleteProject } = useBilling();
  const [editing, setEditing] = useState<BillingProject | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paidInvoiceIds = new Set(invoices.filter((i) => i.status === 'paid').map((i) => i.id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setEditing('new')}
          disabled={clients.length === 0}
          title={clients.length === 0 ? 'Cadastre um cliente primeiro' : undefined}
        >
          Novo projeto
        </Button>
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}

      {projects.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
          Projetos de valor fechado aparecem aqui, com marcos que você fatura ao longo do projeto.
        </p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => {
            const client = clients.find((c) => c.id === p.clientId);
            const invoiced = p.milestones.filter((m) => m.invoiceId).reduce((s, m) => s + m.amount, 0);
            const received = p.milestones.filter((m) => m.invoiceId && paidInvoiceIds.has(m.invoiceId)).reduce((s, m) => s + m.amount, 0);
            const pct = p.totalValue > 0 ? Math.min(100, (received / p.totalValue) * 100) : 0;
            return (
              <li key={p.id} className="rounded-lg border border-[var(--border-subtle)] p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">{p.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{client?.name ?? 'Cliente removido'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] tabular-nums text-[var(--text-primary)]">{formatBRL(p.totalValue)}</div>
                    <div className="text-xs text-[var(--text-muted)] tabular-nums">
                      {formatBRL(received)} recebido · {formatBRL(invoiced)} faturado
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                    aria-label={`Editar ${p.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setError(deleteProject(p.id) ? null : `"${p.name}" já tem marcos faturados.`)}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                    aria-label={`Excluir ${p.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="h-1 rounded-full bg-[var(--bg-surface-active)] overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
                {p.milestones.length > 0 && (
                  <ul className="space-y-1">
                    {p.milestones.map((m) => {
                      const state = !m.invoiceId ? 'A faturar' : paidInvoiceIds.has(m.invoiceId) ? 'Pago' : 'Faturado';
                      return (
                        <li key={m.id} className="flex items-center gap-3 text-xs">
                          <span className="flex-1 min-w-0 truncate text-[var(--text-secondary)]">{m.title}</span>
                          <span className="text-[var(--text-muted)] tabular-nums">{formatDateBR(m.dueDate)}</span>
                          <span className="tabular-nums text-[var(--text-primary)] w-24 text-right">{formatBRL(m.amount)}</span>
                          <span
                            className={`w-16 text-right ${
                              state === 'Pago' ? 'text-emerald-500' : state === 'Faturado' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
                            }`}
                          >
                            {state}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <ProjectForm
          title={editing === 'new' ? 'Novo projeto' : 'Editar projeto'}
          initial={editing === 'new' ? { name: '', clientId: clients[0]?.id ?? '', totalValue: 0, milestones: [] } : editing}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === 'new') addProject(draft);
            else updateProject(editing.id, draft);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};
