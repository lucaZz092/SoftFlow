import { Task } from '../../types';

export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  groupId: 'g1',
  title: 'Tarefa',
  description: '',
  status: 'A Fazer',
  priority: 'Média',
  assignee: null,
  dueDate: '2026-01-31',
  timeline: { start: '2026-01-29', end: '2026-01-31' },
  subtasks: [],
  comments: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});
