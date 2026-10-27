import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import { useProject } from '../../context/ProjectContext';
import { formatBRL, unbilledTime } from '../../lib/billing';
import { formatDuration } from '../../lib/time';
import { Client } from '../../types';
import { Button } from '../ui/Button';
import { fieldClass, FormField, Modal } from '../ui/Modal';

type ClientDraft = Omit<Client, 'id' | 'createdAt'>;
const EMPTY: ClientDraft = { name: '', email: '', document: '', hourlyRate: 0, notes: '' };

const ClientForm: React.FC<{ initial: ClientDraft; onSave: (c: ClientDraft) => void; onClose: () => void; title: string }> = ({
  initial,
  onSave,
  onClose,
  title,
}) => {
  const [draft, setDraft] = useState(initial);
  const set = (patch: Partial<ClientDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const valid = draft.name.trim().length > 0 && draft.hourlyRate >= 0;

  return (
    <Modal
      title={title}
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
        <FormField label="Nome" htmlFor="client-name">
          <input id="client-name" className={fieldClass} value={draft.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="E-mail" htmlFor="client-email">
            <input id="client-email" type="email" className={fieldClass} value={draft.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
          </FormField>
          <FormField label="CPF / CNPJ" htmlFor="client-doc">
            <input id="client-doc" className={fieldClass} value={draft.document ?? ''} onChange={(e) => set({ document: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Valor-hora (R$)" htmlFor="client-rate" hint="Usado para faturar as horas registradas nas demandas deste cliente.">
          <input
            id="client-rate"
            type="number"
            min={0}
            step="0.01"
            className={fieldClass}
            value={draft.hourlyRate}
            onChange={(e) => set({ hourlyRate: Math.max(0, Number(e.target.value) || 0) })}
          />
        </FormField>
        <FormField label="Observações" htmlFor="client-notes">
          <textarea id="client-notes" rows={2} className={fieldClass} value={draft.notes ?? ''} onChange={(e) => set({ notes: e.target.value })} />
        </FormField>
      </div>
    </Modal>
  );
};

export const ClientsPanel: React.FC = () => {
  const { clients, invoices, addClient, updateClient, deleteClient } = useBilling();
  const { allTasks } = useProject();
  const [editing, setEditing] = useState<Client | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remove = (c: Client) => {
    setError(deleteClient(c.id) ? null : `"${c.name}" tem faturas ou projetos; remova-os antes.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditing('new')}>
          Novo cliente
        </Button>
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}

      {clients.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
          Cadastre um cliente para faturar horas e projetos.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {clients.map((c) => {
            const unbilled = unbilledTime(allTasks, c.id).reduce((s, r) => s + r.minutes, 0);
            const invoiceCount = invoices.filter((i) => i.clientId === c.id && i.status !== 'cancelled').length;
            return (
              <li key={c.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[var(--text-primary)] truncate">{c.name}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {formatBRL(c.hourlyRate)}/h · {invoiceCount} {invoiceCount === 1 ? 'fatura' : 'faturas'}
                    {unbilled > 0 && ` · ${formatDuration(unbilled)} a faturar`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                  aria-label={`Editar ${c.name}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                  aria-label={`Excluir ${c.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <ClientForm
          title={editing === 'new' ? 'Novo cliente' : 'Editar cliente'}
          initial={editing === 'new' ? EMPTY : editing}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === 'new') addClient(draft);
            else updateClient(editing.id, draft);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};
