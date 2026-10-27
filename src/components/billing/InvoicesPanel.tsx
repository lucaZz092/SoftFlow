import React, { useState } from 'react';
import { Plus, Printer } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import {
  formatBRL,
  INVOICE_STATUS_LABEL,
  InvoiceDisplayStatus,
  invoiceDisplayStatus,
  invoiceTotal,
  itemTotal,
} from '../../lib/billing';
import { formatDateBR, localDate } from '../../lib/dates';
import { Client, Invoice } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const STATUS_CLASS: Record<InvoiceDisplayStatus, string> = {
  draft: 'text-[var(--text-muted)]',
  sent: 'text-[var(--text-secondary)]',
  paid: 'text-emerald-500',
  overdue: 'text-rose-500',
  cancelled: 'text-[var(--text-muted)] line-through',
};

type Filter = 'all' | 'open' | 'paid' | 'draft' | 'cancelled';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'open', label: 'A receber' },
  { id: 'paid', label: 'Pagas' },
  { id: 'draft', label: 'Rascunhos' },
  { id: 'cancelled', label: 'Canceladas' },
];

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Opens a clean, printable version of the invoice (print or save as PDF from the browser). */
function printInvoice(invoice: Invoice, client: Client | undefined) {
  const rows = invoice.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.description)}</td><td class="n">${i.quantity.toLocaleString('pt-BR')}</td><td class="n">${formatBRL(
          i.unitPrice
        )}</td><td class="n">${formatBRL(itemTotal(i))}</td></tr>`
    )
    .join('');
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Fatura ${escapeHtml(invoice.number)}</title>
<style>
  body{font-family:Inter,system-ui,sans-serif;color:#18181b;max-width:720px;margin:40px auto;padding:0 24px;font-size:14px}
  h1{font-size:22px;margin:0 0 4px} .muted{color:#71717a}
  .meta{display:flex;justify-content:space-between;gap:24px;margin:32px 0}
  table{width:100%;border-collapse:collapse;margin-top:16px} th,td{padding:10px 8px;border-bottom:1px solid #e4e4e7;text-align:left}
  th{font-size:12px;color:#71717a;font-weight:500} .n{text-align:right;white-space:nowrap}
  tfoot td{font-weight:600;border-bottom:none} .notes{margin-top:32px;white-space:pre-wrap}
</style></head><body>
<h1>Fatura ${escapeHtml(invoice.number)}</h1>
<div class="muted">Emitida em ${formatDateBR(invoice.issueDate)} · Vencimento ${formatDateBR(invoice.dueDate)}</div>
<div class="meta"><div><div class="muted">Cliente</div><strong>${escapeHtml(client?.name ?? '')}</strong>
${client?.document ? `<div>${escapeHtml(client.document)}</div>` : ''}${client?.email ? `<div>${escapeHtml(client.email)}</div>` : ''}</div></div>
<table><thead><tr><th>Descrição</th><th class="n">Qtd.</th><th class="n">Valor unit.</th><th class="n">Total</th></tr></thead>
<tbody>${rows}</tbody><tfoot><tr><td colspan="3">Total</td><td class="n">${formatBRL(invoiceTotal(invoice))}</td></tr></tfoot></table>
${invoice.notes ? `<div class="notes">${escapeHtml(invoice.notes)}</div>` : ''}
<script>window.onload=()=>window.print()</script></body></html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

const InvoiceDetail: React.FC<{ invoice: Invoice; onClose: () => void }> = ({ invoice, onClose }) => {
  const { clients, setInvoiceStatus, deleteInvoice } = useBilling();
  const client = clients.find((c) => c.id === invoice.clientId);
  const status = invoiceDisplayStatus(invoice, localDate());

  const act = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <Modal
      title={`Fatura ${invoice.number}`}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" className="mr-auto" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={() => printInvoice(invoice, client)}>
            Imprimir / PDF
          </Button>
          {(invoice.status === 'draft' || invoice.status === 'cancelled') && (
            <Button variant="danger" size="sm" onClick={act(() => deleteInvoice(invoice.id))}>
              Excluir
            </Button>
          )}
          {(invoice.status === 'draft' || invoice.status === 'sent') && (
            <Button variant="ghost" size="sm" onClick={act(() => setInvoiceStatus(invoice.id, 'cancelled'))}>
              Cancelar fatura
            </Button>
          )}
          {invoice.status === 'draft' && (
            <Button variant="secondary" size="sm" onClick={act(() => setInvoiceStatus(invoice.id, 'sent'))}>
              Marcar como enviada
            </Button>
          )}
          {(invoice.status === 'draft' || invoice.status === 'sent') && (
            <Button variant="primary" size="sm" onClick={act(() => setInvoiceStatus(invoice.id, 'paid'))}>
              Marcar como paga
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap justify-between gap-4 text-[13px]">
          <div>
            <div className="text-xs text-[var(--text-muted)]">Cliente</div>
            <div className="text-[var(--text-primary)]">{client?.name ?? 'Cliente removido'}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)]">Emissão · Vencimento</div>
            <div className="text-[var(--text-primary)] tabular-nums">
              {formatDateBR(invoice.issueDate)} · {formatDateBR(invoice.dueDate)}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)]">Situação</div>
            <div className={STATUS_CLASS[status]}>
              {INVOICE_STATUS_LABEL[status]}
              {invoice.paidAt && ` em ${formatDateBR(invoice.paidAt)}`}
            </div>
          </div>
        </div>

        <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {invoice.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-2 text-[13px]">
              <span className="flex-1 min-w-0 truncate text-[var(--text-primary)]">{i.description}</span>
              <span className="text-xs text-[var(--text-muted)] tabular-nums">
                {i.quantity.toLocaleString('pt-BR')} × {formatBRL(i.unitPrice)}
              </span>
              <span className="tabular-nums w-24 text-right text-[var(--text-primary)]">{formatBRL(itemTotal(i))}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-end text-sm tabular-nums text-[var(--text-primary)]">Total: {formatBRL(invoiceTotal(invoice))}</div>
        {invoice.notes && <p className="text-[13px] text-[var(--text-secondary)] whitespace-pre-wrap">{invoice.notes}</p>}
        {invoice.status === 'sent' && (
          <p className="text-xs text-[var(--text-muted)]">Cancelar libera as horas e marcos desta fatura para serem faturados de novo.</p>
        )}
      </div>
    </Modal>
  );
};

export const InvoicesPanel: React.FC<{ onNewInvoice: () => void }> = ({ onNewInvoice }) => {
  const { invoices, clients } = useBilling();
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const today = localDate();

  const visible = invoices.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'open') return i.status === 'sent';
    return i.status === filter;
  });
  const openInvoice = invoices.find((i) => i.id === openId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                filter === f.id
                  ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={onNewInvoice}
          disabled={clients.length === 0}
          title={clients.length === 0 ? 'Cadastre um cliente primeiro' : undefined}
        >
          Nova fatura
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">Nenhuma fatura aqui.</p>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {visible.map((inv) => {
            const status = invoiceDisplayStatus(inv, today);
            return (
              <li key={inv.id}>
                <button type="button" onClick={() => setOpenId(inv.id)} className="w-full flex items-center gap-3 py-2.5 text-left cursor-pointer group">
                  <span className="w-20 shrink-0 text-xs tabular-nums text-[var(--text-muted)]">{inv.number}</span>
                  <span className="flex-1 min-w-0 truncate text-[13px] text-[var(--text-primary)] group-hover:underline underline-offset-2">
                    {clients.find((c) => c.id === inv.clientId)?.name ?? 'Cliente removido'}
                  </span>
                  <span className="hidden sm:block text-xs tabular-nums text-[var(--text-muted)]">vence {formatDateBR(inv.dueDate)}</span>
                  <span className={`w-20 text-right text-xs ${STATUS_CLASS[status]}`}>{INVOICE_STATUS_LABEL[status]}</span>
                  <span className="w-28 text-right text-[13px] tabular-nums text-[var(--text-primary)]">{formatBRL(invoiceTotal(inv))}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openInvoice && <InvoiceDetail invoice={openInvoice} onClose={() => setOpenId(null)} />}
    </div>
  );
};
