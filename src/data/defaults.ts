import { AutomationWorkflow, CustomColumn, Group } from '../types';

// Starting content for a new, empty workspace (inserted on first sign-in).

export const DEFAULT_GROUPS: Group[] = [
  {
    id: 'group-marketing',
    title: 'Marketing',
    color: '#0073ea',
    collapsed: false,
  },
  {
    id: 'group-vendas',
    title: 'Vendas & Growth',
    color: '#fa6400',
    collapsed: false,
  },
  {
    id: 'group-produto',
    title: 'Produto & Engenharia',
    color: '#579bfc',
    collapsed: false,
  },
  {
    id: 'group-concluido',
    title: 'Concluído',
    color: '#00c875',
    collapsed: false,
  },
];

export const DEFAULT_AUTOMATIONS: AutomationWorkflow[] = [
  {
    id: 'auto-done',
    name: 'Mover concluídas para Concluído',
    description: 'Quando uma demanda for marcada como "Pronto", movê-la para o grupo Concluído.',
    enabled: true,
    trigger: {
      type: 'STATUS_CHANGE',
      label: 'Quando o status mudar para "Pronto"',
      targetStatus: 'Pronto',
    },
    action: {
      type: 'MOVE_TO_GROUP',
      label: 'Mover para o grupo Concluído',
      targetGroupId: 'group-concluido',
    },
    executionCount: 0,
    lastRunAt: 'Nunca executado',
  },
  {
    id: 'auto-critical',
    name: 'Alerta de demanda crítica',
    description: 'Quando uma demanda receber prioridade "Crítica", registrar um alerta nos comentários dela.',
    enabled: true,
    trigger: {
      type: 'PRIORITY_SET_CRITICAL',
      label: 'Quando a prioridade for definida como Crítica',
    },
    action: {
      type: 'NOTIFY_TEAM',
      label: 'Registrar alerta na demanda',
    },
    executionCount: 0,
    lastRunAt: 'Nunca executado',
  },
];

export const DEFAULT_CUSTOM_COLUMNS: CustomColumn[] = [
  { id: 'col-estimate', title: 'Estimativa (h)', type: 'number' },
];
