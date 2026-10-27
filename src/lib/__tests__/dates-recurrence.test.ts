import { describe, expect, it } from 'vitest';
import { addDays, addMonths } from '../dates';
import { describeRecurrence, nextOccurrence, shiftDate } from '../recurrence';
import { makeTask } from './fixtures';

describe('dates', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
  });

  it('clamps month addition to the last day of the month', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-11-15', 2)).toBe('2027-01-15');
  });
});

describe('recurrence', () => {
  it('shifts dates by frequency and interval', () => {
    expect(shiftDate('2026-03-10', { frequency: 'daily', interval: 1 })).toBe('2026-03-11');
    expect(shiftDate('2026-03-10', { frequency: 'weekly', interval: 2 })).toBe('2026-03-24');
    expect(shiftDate('2026-03-10', { frequency: 'monthly', interval: 3 })).toBe('2026-06-10');
  });

  it('builds the next occurrence with progress reset', () => {
    const task = makeTask({
      status: 'Pronto',
      recurrence: { frequency: 'monthly', interval: 1 },
      subtasks: [{ id: 's1', title: 'Passo', completed: true }],
      timeEntries: [{ id: 'e1', start: '2026-01-30T10:00:00Z', end: '2026-01-30T11:00:00Z' }],
      tags: ['t1'],
    });
    const next = nextOccurrence(task, 'task-2', new Date('2026-01-31T12:00:00Z'));
    expect(next).toMatchObject({
      id: 'task-2',
      status: 'A Fazer',
      dueDate: '2026-02-28',
      timeline: { start: '2026-02-28', end: '2026-02-28' },
      subtasks: [{ id: 's1', title: 'Passo', completed: false }],
      timeEntries: [],
      tags: ['t1'],
      recurrence: { frequency: 'monthly', interval: 1 },
    });
  });

  it('describes recurrence in Portuguese', () => {
    expect(describeRecurrence({ frequency: 'weekly', interval: 1 })).toBe('Repete a cada semana');
    expect(describeRecurrence({ frequency: 'daily', interval: 3 })).toBe('Repete a cada 3 dias');
  });
});
