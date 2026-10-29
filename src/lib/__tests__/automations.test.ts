import { describe, expect, it } from 'vitest';
import {
  conditionMatches,
  describeAutomation,
  fillTemplate,
  invoiceTaskIds,
  overdueInvoicesToFire,
  overdueTasksToFire,
  triggerMatches,
} from '../automations';
import { AutomationWorkflow, Invoice } from '../../types';
import { makeTask } from './fixtures';

const auto = (overrides: Partial<AutomationWorkflow> = {}): AutomationWorkflow => ({
  id: 'a1',
  name: 'Teste',
  description: '',
  enabled: true,
  trigger: { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' },
  action: { type: 'MOVE_TO_GROUP', label: '', targetGroupId: 'g-done' },
  executionCount: 0,
  ...overrides,
});

const invoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  id: 'i1',
  number: '2026-004',
  clientId: 'c1',
  issueDate: '2026-03-01',
  dueDate: '2026-03-10',
  status: 'sent',
  items: [
    { id: 'x', description: 'A', quantity: 1, unitPrice: 10, source: { type: 'time', taskId: 't1', entryIds: ['e1'] } },
    { id: 'y', description: 'B', quantity: 1, unitPrice: 10, source: { type: 'time', taskId: 't1', entryIds: ['e2'] } },
    { id: 'z', description: 'C', quantity: 1, unitPrice: 10 },
  ],
  createdAt: '',
  ...overrides,
});

describe('trigger matching', () => {
  it('matches status changes to the target status only', () => {
    const a = auto();
    expect(triggerMatches(a, { type: 'STATUS_CHANGE', task: makeTask({ status: 'Pronto' }), from: 'A Fazer' })).toBe(true);
    expect(triggerMatches(a, { type: 'STATUS_CHANGE', task: makeTask({ status: 'Parado' }), from: 'A Fazer' })).toBe(false);
    expect(triggerMatches(a, { type: 'TASK_CREATED', task: makeTask() })).toBe(false);
  });

  it('treats legacy PRIORITY_SET_CRITICAL as a change to Crítica', () => {
    const a = auto({ trigger: { type: 'PRIORITY_SET_CRITICAL', label: '' } });
    expect(triggerMatches(a, { type: 'PRIORITY_CHANGE', task: makeTask({ priority: 'Crítica' }), from: 'Média' })).toBe(true);
    expect(triggerMatches(a, { type: 'PRIORITY_CHANGE', task: makeTask({ priority: 'Alta' }), from: 'Média' })).toBe(false);
  });

  it('matches tags and manual runs by id', () => {
    const a = auto({ trigger: { type: 'TAG_ADDED', label: '', tagId: 'urgente' } });
    expect(triggerMatches(a, { type: 'TAG_ADDED', task: makeTask(), tagId: 'urgente' })).toBe(true);
    expect(triggerMatches(a, { type: 'TAG_ADDED', task: makeTask(), tagId: 'outra' })).toBe(false);
    expect(triggerMatches(a, { type: 'MANUAL', automationId: 'a1', taskId: 't' })).toBe(true);
    expect(triggerMatches(a, { type: 'MANUAL', automationId: 'a2', taskId: 't' })).toBe(false);
  });
});

describe('conditions', () => {
  it('filters by group, priority, tag and client', () => {
    const task = makeTask({ groupId: 'g1', priority: 'Alta', tags: ['t1'], clientId: 'c1' });
    const cond = (field: string, value = '') => auto({ condition: { field, operator: 'equals', value, label: '' } });
    expect(conditionMatches(cond('groupId', 'g1'), task)).toBe(true);
    expect(conditionMatches(cond('groupId', 'g2'), task)).toBe(false);
    expect(conditionMatches(cond('priority', 'Alta'), task)).toBe(true);
    expect(conditionMatches(cond('tag', 't1'), task)).toBe(true);
    expect(conditionMatches(cond('tag', 't9'), task)).toBe(false);
    expect(conditionMatches(cond('clientId', 'c1'), task)).toBe(true);
    expect(conditionMatches(cond('hasClient'), makeTask())).toBe(false);
    expect(conditionMatches(cond('clientId', 'c1'), null, invoice())).toBe(true);
  });
});

describe('time-based triggers', () => {
  it('fires once per due date for overdue tasks', () => {
    const a = auto({ trigger: { type: 'TASK_OVERDUE', label: '' } });
    const tasks = [
      makeTask({ id: 'late', dueDate: '2026-03-01' }),
      makeTask({ id: 'done', dueDate: '2026-03-01', status: 'Pronto' }),
      makeTask({ id: 'future', dueDate: '2026-04-01' }),
      makeTask({ id: 'fired', dueDate: '2026-03-01', automationRuns: { a1: '2026-03-01' } }),
      makeTask({ id: 'moved', dueDate: '2026-03-05', automationRuns: { a1: '2026-03-01' } }),
    ];
    expect(overdueTasksToFire(a, tasks, '2026-03-20').map((t) => t.id)).toEqual(['late', 'moved']);
  });

  it('fires for sent invoices past due, once per due date', () => {
    const a = auto({ id: 'inv', trigger: { type: 'INVOICE_OVERDUE', label: '' } });
    const list = [
      invoice({ id: 'late' }),
      invoice({ id: 'paid', status: 'paid' }),
      invoice({ id: 'fired', automationRuns: { inv: '2026-03-10' } }),
    ];
    expect(overdueInvoicesToFire(a, list, '2026-03-11').map((i) => i.id)).toEqual(['late']);
  });
});

describe('helpers', () => {
  it('lists the tasks an invoice billed, without duplicates', () => {
    expect(invoiceTaskIds(invoice())).toEqual(['t1']);
  });

  it('fills templates', () => {
    expect(
      fillTemplate('Cobrar {fatura} de {cliente} ({demanda})', {
        task: makeTask({ title: 'API' }),
        invoice: invoice(),
        client: { id: 'c1', name: 'Acme', hourlyRate: 0, createdAt: '' },
      })
    ).toBe('Cobrar 2026-004 de Acme (API)');
  });

  it('describes an automation as a sentence', () => {
    const names = { groups: [{ id: 'g-done', title: 'Concluído', color: '', collapsed: false }], tags: [], clients: [], members: [] };
    expect(describeAutomation(auto(), names)).toBe('Quando o status mudar para "Pronto", mover para o grupo "Concluído".');
    expect(
      describeAutomation(
        auto({ trigger: { type: 'INVOICE_PAID', label: '' }, action: { type: 'ARCHIVE_TASK', label: '' }, condition: { field: 'hasClient', operator: 'is', value: '', label: '' } }),
        names
      )
    ).toBe('Quando uma fatura for paga, se a fatura tiver cliente, arquivar a demanda.');
  });
});
