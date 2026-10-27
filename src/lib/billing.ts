import { BillingProject, Client, Invoice, InvoiceItem, Task } from '../types';
import { entryMinutes } from './time';

export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const itemTotal = (item: InvoiceItem) => round2(item.quantity * item.unitPrice);

export const invoiceTotal = (invoice: Invoice) => round2(invoice.items.reduce((sum, i) => sum + itemTotal(i), 0));

const round2 = (n: number) => Math.round(n * 100) / 100;

export type InvoiceDisplayStatus = Invoice['status'] | 'overdue';

/** "overdue" is derived: sent and past the due date */
export const invoiceDisplayStatus = (invoice: Invoice, today: string): InvoiceDisplayStatus =>
  invoice.status === 'sent' && invoice.dueDate < today ? 'overdue' : invoice.status;

export const INVOICE_STATUS_LABEL: Record<InvoiceDisplayStatus, string> = {
  draft: 'Rascunho',
  sent: 'Enviada',
  paid: 'Paga',
  cancelled: 'Cancelada',
  overdue: 'Vencida',
};

/** Next sequential number for the year: 2026-001, 2026-002, ... */
export function nextInvoiceNumber(invoices: Invoice[], year: number) {
  const prefix = `${year}-`;
  const max = invoices
    .filter((i) => i.number.startsWith(prefix))
    .reduce((acc, i) => Math.max(acc, Number(i.number.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

/** Finished, not-yet-billed time entries of a client's tasks within [from, to] (YYYY-MM-DD, inclusive). */
export function unbilledTime(tasks: Task[], clientId: string, from?: string, to?: string) {
  return tasks
    .filter((t) => t.clientId === clientId)
    .map((task) => {
      const entries = (task.timeEntries ?? []).filter((e) => {
        if (e.end === null || e.invoiceId) return false;
        const day = e.start.slice(0, 10);
        return (!from || day >= from) && (!to || day <= to);
      });
      const minutes = entries.reduce((sum, e) => sum + entryMinutes(e), 0);
      return { task, entries, minutes };
    })
    .filter((r) => r.entries.length > 0 && r.minutes > 0);
}

/** One invoice line per task: hours (rounded to 2 decimals) × the client's hourly rate. */
export function timeItems(tasks: Task[], client: Client, from?: string, to?: string, makeId = randomId): InvoiceItem[] {
  return unbilledTime(tasks, client.id, from, to).map(({ task, entries, minutes }) => ({
    id: makeId(),
    description: task.title,
    quantity: round2(minutes / 60),
    unitPrice: client.hourlyRate,
    source: { type: 'time', taskId: task.id, entryIds: entries.map((e) => e.id) },
  }));
}

export function milestoneItem(project: BillingProject, milestoneId: string, makeId = randomId): InvoiceItem | null {
  const m = project.milestones.find((x) => x.id === milestoneId);
  if (!m) return null;
  return {
    id: makeId(),
    description: `${project.name}: ${m.title}`,
    quantity: 1,
    unitPrice: m.amount,
    source: { type: 'milestone', projectId: project.id, milestoneId: m.id },
  };
}

/**
 * Applies (or, with invoiceId = undefined, releases) the invoice link on the sources an invoice consumed:
 * time entries on tasks and milestones on projects. Returns only the objects that changed.
 */
export function linkInvoiceSources(
  items: InvoiceItem[],
  invoiceId: string | undefined,
  tasks: Task[],
  projects: BillingProject[]
) {
  const entryIdsByTask = new Map<string, Set<string>>();
  const milestoneIdsByProject = new Map<string, Set<string>>();
  for (const item of items) {
    if (item.source?.type === 'time') {
      const set = entryIdsByTask.get(item.source.taskId) ?? new Set();
      item.source.entryIds.forEach((id) => set.add(id));
      entryIdsByTask.set(item.source.taskId, set);
    } else if (item.source?.type === 'milestone') {
      const set = milestoneIdsByProject.get(item.source.projectId) ?? new Set();
      set.add(item.source.milestoneId);
      milestoneIdsByProject.set(item.source.projectId, set);
    }
  }

  const changedTasks = tasks
    .filter((t) => entryIdsByTask.has(t.id))
    .map((t) => {
      const ids = entryIdsByTask.get(t.id)!;
      return { ...t, timeEntries: (t.timeEntries ?? []).map((e) => (ids.has(e.id) ? { ...e, invoiceId } : e)) };
    });

  const changedProjects = projects
    .filter((p) => milestoneIdsByProject.has(p.id))
    .map((p) => {
      const ids = milestoneIdsByProject.get(p.id)!;
      return { ...p, milestones: p.milestones.map((m) => (ids.has(m.id) ? { ...m, invoiceId } : m)) };
    });

  return { changedTasks, changedProjects };
}

export const randomId = () => Math.random().toString(36).slice(2, 10);

/** Revenue summary for the billing dashboard. Amounts in BRL. */
export function billingSummary(invoices: Invoice[], today: string) {
  const month = today.slice(0, 7);
  let receivedThisMonth = 0;
  let receivable = 0;
  let overdue = 0;
  for (const inv of invoices) {
    const total = invoiceTotal(inv);
    if (inv.status === 'paid' && inv.paidAt?.slice(0, 7) === month) receivedThisMonth += total;
    if (inv.status === 'sent') {
      receivable += total;
      if (inv.dueDate < today) overdue += total;
    }
  }
  return { receivedThisMonth: round2(receivedThisMonth), receivable: round2(receivable), overdue: round2(overdue) };
}

/** Paid revenue per month for the last `months` months, oldest first: [{ month: '2026-08', total }] */
export function monthlyRevenue(invoices: Invoice[], today: string, months = 6) {
  const [y, m] = today.split('-').map(Number);
  const keys = Array.from({ length: months }, (_, i) => {
    const d = new Date(y, m - 1 - (months - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const totals = new Map(keys.map((k) => [k, 0]));
  for (const inv of invoices) {
    const key = inv.paidAt?.slice(0, 7);
    if (inv.status === 'paid' && key && totals.has(key)) totals.set(key, totals.get(key)! + invoiceTotal(inv));
  }
  return keys.map((k) => ({ month: k, total: round2(totals.get(k)!) }));
}
