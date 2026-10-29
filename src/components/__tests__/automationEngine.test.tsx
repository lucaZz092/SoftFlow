// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AutomationWorkflow, Task } from '../../types';

/**
 * End-to-end check of the automation engine with the real task/billing contexts.
 * Supabase is replaced by an in-memory table store; auth by a fixed user.
 */

const db = new Map<string, Map<string, unknown>>();
const table = (name: string) => {
  if (!db.has(name)) db.set(name, new Map());
  return db.get(name)!;
};

vi.mock('../../lib/supabase', () => {
  const query = (name: string) => {
    const rows = () => [...table(name).entries()].map(([id, data]) => ({ id, data, created_at: '' }));
    const chain: Record<string, unknown> = {
      select: () => chain,
      order: () => chain,
      limit: () => chain,
      then: (resolve: (v: unknown) => void) => resolve({ data: rows(), error: null }),
      upsert: (input: { id: string; data: unknown } | { id: string; data: unknown }[]) => {
        (Array.isArray(input) ? input : [input]).forEach((r) => table(name).set(r.id, r.data));
        return Promise.resolve({ error: null });
      },
      delete: () => ({
        in: (_col: string, ids: string[]) => {
          ids.forEach((id) => table(name).delete(id));
          return Promise.resolve({ error: null });
        },
      }),
    };
    return chain;
  };
  const channel = { on: () => channel, subscribe: () => channel };
  return {
    isSupabaseConfigured: true,
    supabase: {
      from: (name: string) => query(name),
      channel: () => channel,
      removeChannel: () => Promise.resolve(),
      storage: { from: () => ({ remove: () => Promise.resolve({ error: null }) }) },
    },
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Lucas', email: 'l@x.com', avatar: '', initials: 'L', color: '#000' },
  }),
  toAssignee: (p: { id: string; name: string }) => ({ ...p, email: '', avatar: '', initials: 'X', color: '#000' }),
}));

import { ProjectProvider, useProject } from '../../context/ProjectContext';
import { BillingProvider, useBilling } from '../../context/BillingContext';
import { AutomationEngine } from '../AutomationEngine';

type Ctx = { project: ReturnType<typeof useProject>; billing: ReturnType<typeof useBilling> };
const ref: { current: Ctx | null } = { current: null };

const Probe: React.FC = () => {
  ref.current = { project: useProject(), billing: useBilling() };
  return null;
};

const ctx = () => ref.current!;
const task = (id: string) => ctx().project.allTasks.find((t) => t.id === id)!;
const flush = () => act(async () => new Promise((r) => setTimeout(r, 0)));

const automation = (id: string, trigger: AutomationWorkflow['trigger'], action: AutomationWorkflow['action'], extra: Partial<AutomationWorkflow> = {}) =>
  table('automations').set(id, { id, name: id, description: '', enabled: true, trigger, action, executionCount: 0, ...extra });

const seedTask = (overrides: Partial<Task>) => {
  const t: Task = {
    id: 'task-1',
    groupId: 'group-produto',
    title: 'API',
    description: '',
    status: 'A Fazer',
    priority: 'Média',
    assignee: null,
    dueDate: '2099-01-01',
    timeline: { start: '2099-01-01', end: '2099-01-01' },
    subtasks: [],
    comments: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
  table('tasks').set(t.id, t);
};

async function mount() {
  render(
    <ProjectProvider>
      <BillingProvider>
        <AutomationEngine />
        <Probe />
      </BillingProvider>
    </ProjectProvider>
  );
  await waitFor(() => expect(ctx().project.isDataLoaded && ctx().billing.isLoaded).toBe(true));
}

beforeEach(() => {
  db.clear();
  // Groups exist so the seed isn't used; automations table seeded per test (non-empty skips defaults)
  ['group-produto', 'group-concluido'].forEach((id) => table('groups').set(id, { id, title: id, color: '#000', collapsed: false }));
});

afterEach(() => {
  // Unmount so each test has a single engine subscribed to the event bus
  cleanup();
  ref.current = null;
});

describe('automation engine', () => {
  it('runs a status rule from a kanban move and logs it', async () => {
    automation('move', { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' }, { type: 'MOVE_TO_GROUP', label: '', targetGroupId: 'group-concluido' });
    seedTask({});
    await mount();

    act(() => ctx().project.moveTaskToStatus('task-1', 'Pronto'));
    await waitFor(() => expect(task('task-1').groupId).toBe('group-concluido'));
    expect(ctx().project.runLogs[0]).toMatchObject({ workflowId: 'move', status: 'success' });
    expect(ctx().project.automations.find((a) => a.id === 'move')!.executionCount).toBe(1);
  });

  it('starts and stops the timer from status changes', async () => {
    automation('start', { type: 'STATUS_CHANGE', label: '', targetStatus: 'Em andamento' }, { type: 'START_TIMER', label: '' });
    automation('stop', { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' }, { type: 'STOP_TIMER', label: '' });
    seedTask({});
    await mount();

    act(() => ctx().project.changeTaskStatus('task-1', 'Em andamento'));
    await waitFor(() => expect(ctx().project.runningTimer?.taskId).toBe('task-1'));
    act(() => ctx().project.changeTaskStatus('task-1', 'Pronto'));
    await waitFor(() => expect(ctx().project.runningTimer).toBeNull());
    expect(task('task-1').timeEntries).toHaveLength(1);
    expect(task('task-1').timeEntries![0].end).not.toBeNull();
  });

  it('chains rules (status → priority → comment) and ignores paused rules and conditions that fail', async () => {
    automation('a', { type: 'STATUS_CHANGE', label: '', targetStatus: 'Em Revisão' }, { type: 'SET_PRIORITY', label: '', targetPriority: 'Alta' });
    automation('b', { type: 'PRIORITY_CHANGE', label: '', targetPriority: 'Alta' }, { type: 'ADD_COMMENT', label: '', text: 'Revisar {demanda}' });
    automation('paused', { type: 'STATUS_CHANGE', label: '', targetStatus: 'Em Revisão' }, { type: 'ARCHIVE_TASK', label: '' }, { enabled: false });
    automation(
      'other-group',
      { type: 'STATUS_CHANGE', label: '', targetStatus: 'Em Revisão' },
      { type: 'ADD_COMMENT', label: '', text: 'não deveria' },
      { condition: { field: 'groupId', operator: 'equals', value: 'group-concluido', label: '' } }
    );
    seedTask({});
    await mount();

    act(() => ctx().project.changeTaskStatus('task-1', 'Em Revisão'));
    await waitFor(() => expect(task('task-1').comments.map((c) => c.text)).toEqual(['Revisar API']));
    expect(task('task-1').priority).toBe('Alta');
    expect(task('task-1').archivedAt).toBeUndefined();
  });

  it('stops infinite loops between rules', async () => {
    automation('ping', { type: 'STATUS_CHANGE', label: '', targetStatus: 'Parado' }, { type: 'SET_STATUS', label: '', targetStatus: 'Em andamento' });
    automation('pong', { type: 'STATUS_CHANGE', label: '', targetStatus: 'Em andamento' }, { type: 'SET_STATUS', label: '', targetStatus: 'Parado' });
    seedTask({});
    await mount();

    act(() => ctx().project.changeTaskStatus('task-1', 'Parado'));
    await flush();
    await flush();
    // ping → Em andamento, pong → Parado, then each rule already ran in this chain: stops
    expect(ctx().project.runLogs.length).toBe(2);
  });

  it('drafts an invoice when a client task is done, then archives it when the invoice is paid', async () => {
    table('clients').set('c1', { id: 'c1', name: 'Acme', hourlyRate: 100, createdAt: '' });
    automation(
      'draft',
      { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' },
      { type: 'CREATE_INVOICE_DRAFT', label: '' },
      { condition: { field: 'hasClient', operator: 'is', value: '', label: '' } }
    );
    automation('archive', { type: 'INVOICE_PAID', label: '' }, { type: 'ARCHIVE_TASK', label: '' });
    seedTask({
      clientId: 'c1',
      timeEntries: [{ id: 'e1', start: '2026-03-02T10:00:00Z', end: '2026-03-02T12:00:00Z' }],
    });
    await mount();

    act(() => ctx().project.changeTaskStatus('task-1', 'Pronto'));
    await waitFor(() => expect(ctx().billing.invoices).toHaveLength(1));
    const invoice = ctx().billing.invoices[0];
    expect(invoice).toMatchObject({ clientId: 'c1', status: 'draft' });
    expect(invoice.items[0]).toMatchObject({ quantity: 2, unitPrice: 100 });
    await waitFor(() => expect(task('task-1').timeEntries![0].invoiceId).toBe(invoice.id));
    // The status change that triggered the draft survives the time-entry update
    expect(task('task-1').status).toBe('Pronto');

    act(() => ctx().billing.setInvoiceStatus(invoice.id, 'paid'));
    await waitFor(() => expect(task('task-1').archivedAt).toBeDefined());
  });

  it('logs a failed run with the reason when the action cannot apply', async () => {
    automation('draft', { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' }, { type: 'CREATE_INVOICE_DRAFT', label: '' });
    seedTask({});
    await mount();

    act(() => ctx().project.changeTaskStatus('task-1', 'Pronto'));
    await waitFor(() => expect(ctx().project.runLogs[0]?.status).toBe('failed'));
    expect(ctx().project.runLogs[0].details).toContain('não tem cliente');
  });

  it('fires time-based rules once per due date', async () => {
    automation('late', { type: 'TASK_OVERDUE', label: '' }, { type: 'SET_PRIORITY', label: '', targetPriority: 'Alta' });
    seedTask({ dueDate: '2020-01-01' });
    await mount();

    await waitFor(() => expect(task('task-1').priority).toBe('Alta'));
    expect(task('task-1').automationRuns).toEqual({ late: '2020-01-01' });
    expect(ctx().project.runLogs).toHaveLength(1);
  });

  it('runs a rule manually on a chosen task, even when paused', async () => {
    automation('tag', { type: 'TASK_CREATED', label: '' }, { type: 'ADD_COMMENT', label: '', text: 'manual {demanda}' }, { enabled: false });
    seedTask({});
    await mount();

    act(() => ctx().project.triggerManualAutomation('tag', 'task-1'));
    await waitFor(() => expect(task('task-1').comments.map((c) => c.text)).toEqual(['manual API']));
  });
});
