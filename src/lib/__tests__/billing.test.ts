import { describe, expect, it } from 'vitest';
import {
  billingSummary,
  invoiceDisplayStatus,
  invoiceTotal,
  linkInvoiceSources,
  milestoneItem,
  monthlyRevenue,
  nextInvoiceNumber,
  timeItems,
} from '../billing';
import { BillingProject, Client, Invoice } from '../../types';
import { makeTask } from './fixtures';

const client: Client = { id: 'c1', name: 'Acme', hourlyRate: 150, createdAt: '' };

const invoice = (overrides: Partial<Invoice>): Invoice => ({
  id: 'i1',
  number: '2026-001',
  clientId: 'c1',
  issueDate: '2026-03-01',
  dueDate: '2026-03-15',
  status: 'sent',
  items: [{ id: 'x', description: 'Serviço', quantity: 2, unitPrice: 100.5 }],
  createdAt: '',
  ...overrides,
});

describe('invoices', () => {
  it('totals items and derives overdue', () => {
    expect(invoiceTotal(invoice({}))).toBe(201);
    expect(invoiceDisplayStatus(invoice({}), '2026-03-16')).toBe('overdue');
    expect(invoiceDisplayStatus(invoice({}), '2026-03-15')).toBe('sent');
    expect(invoiceDisplayStatus(invoice({ status: 'paid' }), '2026-04-01')).toBe('paid');
  });

  it('numbers invoices sequentially per year', () => {
    const list = [invoice({ number: '2026-001' }), invoice({ number: '2026-009' }), invoice({ number: '2025-040' })];
    expect(nextInvoiceNumber(list, 2026)).toBe('2026-010');
    expect(nextInvoiceNumber(list, 2027)).toBe('2027-001');
  });

  it('summarizes revenue', () => {
    const list = [
      invoice({ id: 'a', status: 'paid', paidAt: '2026-03-10' }),
      invoice({ id: 'b', status: 'sent', dueDate: '2026-03-01' }),
      invoice({ id: 'c', status: 'sent', dueDate: '2026-04-01' }),
      invoice({ id: 'd', status: 'draft' }),
    ];
    expect(billingSummary(list, '2026-03-20')).toEqual({ receivedThisMonth: 201, receivable: 402, overdue: 201 });
    expect(monthlyRevenue(list, '2026-03-20', 3)).toEqual([
      { month: '2026-01', total: 0 },
      { month: '2026-02', total: 0 },
      { month: '2026-03', total: 201 },
    ]);
  });
});

describe('time and milestone items', () => {
  const tasks = [
    makeTask({
      id: 't1',
      title: 'API',
      clientId: 'c1',
      timeEntries: [
        { id: 'e1', start: '2026-03-02T10:00:00Z', end: '2026-03-02T11:30:00Z' },
        { id: 'e2', start: '2026-03-03T10:00:00Z', end: '2026-03-03T10:20:00Z', invoiceId: 'old' },
        { id: 'e3', start: '2026-03-04T10:00:00Z', end: null },
        { id: 'e4', start: '2026-04-01T10:00:00Z', end: '2026-04-01T11:00:00Z' },
      ],
    }),
    makeTask({ id: 't2', clientId: 'other', timeEntries: [{ id: 'e5', start: '2026-03-02T10:00:00Z', end: '2026-03-02T11:00:00Z' }] }),
  ];

  it('bills only finished, unbilled entries of the client within the period', () => {
    const items = timeItems(tasks, client, '2026-03-01', '2026-03-31', () => 'id');
    expect(items).toEqual([
      {
        id: 'id',
        description: 'API',
        quantity: 1.5,
        unitPrice: 150,
        source: { type: 'time', taskId: 't1', entryIds: ['e1'] },
      },
    ]);
  });

  it('links and releases invoice sources', () => {
    const project: BillingProject = {
      id: 'p1',
      clientId: 'c1',
      name: 'Site',
      totalValue: 1000,
      milestones: [{ id: 'm1', title: 'Entrega', amount: 1000 }],
      createdAt: '',
    };
    const items = [...timeItems(tasks, client, '2026-03-01', '2026-03-31'), milestoneItem(project, 'm1')!];

    const linked = linkInvoiceSources(items, 'inv-1', tasks, [project]);
    expect(linked.changedTasks).toHaveLength(1);
    expect(linked.changedTasks[0].timeEntries!.find((e) => e.id === 'e1')!.invoiceId).toBe('inv-1');
    expect(linked.changedTasks[0].timeEntries!.find((e) => e.id === 'e4')!.invoiceId).toBeUndefined();
    expect(linked.changedProjects[0].milestones[0].invoiceId).toBe('inv-1');

    const released = linkInvoiceSources(items, undefined, linked.changedTasks, linked.changedProjects);
    expect(released.changedTasks[0].timeEntries!.find((e) => e.id === 'e1')!.invoiceId).toBeUndefined();
    expect(released.changedProjects[0].milestones[0].invoiceId).toBeUndefined();
  });
});
