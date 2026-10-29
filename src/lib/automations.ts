import {
  AutomationActionType,
  AutomationTriggerType,
  AutomationWorkflow,
  Client,
  Group,
  Invoice,
  Tag,
  Task,
} from '../types';
import { AutomationEvent } from './automationEvents';

export const MAX_CHAIN_DEPTH = 3;

/** Triggers grouped by what they're about; "invoice" triggers act on the invoice's tasks. */
export const TRIGGERS: { type: AutomationTriggerType; label: string; scope: 'task' | 'invoice' }[] = [
  { type: 'STATUS_CHANGE', label: 'O status mudar (inclui mover no kanban)', scope: 'task' },
  { type: 'TASK_CREATED', label: 'Uma demanda for criada', scope: 'task' },
  { type: 'PRIORITY_CHANGE', label: 'A prioridade mudar', scope: 'task' },
  { type: 'TAG_ADDED', label: 'Uma etiqueta for adicionada', scope: 'task' },
  { type: 'TASK_OVERDUE', label: 'O prazo de uma demanda vencer', scope: 'task' },
  { type: 'TIMER_STOPPED', label: 'O cronômetro for parado', scope: 'task' },
  { type: 'INVOICE_CREATED', label: 'Uma fatura for criada', scope: 'invoice' },
  { type: 'INVOICE_PAID', label: 'Uma fatura for paga', scope: 'invoice' },
  { type: 'INVOICE_OVERDUE', label: 'Uma fatura vencer sem pagamento', scope: 'invoice' },
];

export const ACTIONS: { type: AutomationActionType; label: string; forInvoices: boolean }[] = [
  { type: 'SET_STATUS', label: 'Mudar o status', forInvoices: true },
  { type: 'SET_PRIORITY', label: 'Mudar a prioridade', forInvoices: true },
  { type: 'MOVE_TO_GROUP', label: 'Mover para um grupo', forInvoices: true },
  { type: 'ADD_TAG', label: 'Adicionar etiqueta', forInvoices: true },
  { type: 'ASSIGN_USER', label: 'Atribuir responsável', forInvoices: true },
  { type: 'ADD_COMMENT', label: 'Comentar na demanda', forInvoices: true },
  { type: 'NOTIFY_TEAM', label: 'Notificar (desktop + comentário)', forInvoices: true },
  { type: 'START_TIMER', label: 'Iniciar o cronômetro', forInvoices: false },
  { type: 'STOP_TIMER', label: 'Parar o cronômetro', forInvoices: false },
  { type: 'ARCHIVE_TASK', label: 'Arquivar a demanda', forInvoices: true },
  { type: 'CREATE_TASK', label: 'Criar uma demanda de acompanhamento', forInvoices: true },
  { type: 'CREATE_INVOICE_DRAFT', label: 'Criar rascunho de fatura com as horas da demanda', forInvoices: false },
];

export const triggerScope = (type: AutomationTriggerType) =>
  TRIGGERS.find((t) => t.type === type)?.scope ?? 'task';

/** Legacy PRIORITY_SET_CRITICAL behaves as PRIORITY_CHANGE to "Crítica" */
export const normalizeTrigger = (auto: AutomationWorkflow): AutomationWorkflow['trigger'] =>
  auto.trigger.type === 'PRIORITY_SET_CRITICAL'
    ? { ...auto.trigger, type: 'PRIORITY_CHANGE', targetPriority: 'Crítica' }
    : auto.trigger;

/** Does this automation's trigger fire for this event? (Time-based triggers are handled by the scheduler.) */
export function triggerMatches(auto: AutomationWorkflow, event: AutomationEvent): boolean {
  if (event.type === 'MANUAL') return event.automationId === auto.id;
  const trigger = normalizeTrigger(auto);
  if (trigger.type !== event.type) return false;
  switch (event.type) {
    case 'STATUS_CHANGE':
      return !trigger.targetStatus || event.task.status === trigger.targetStatus;
    case 'PRIORITY_CHANGE':
      return !trigger.targetPriority || event.task.priority === trigger.targetPriority;
    case 'TAG_ADDED':
      return !trigger.tagId || event.tagId === trigger.tagId;
    default:
      return true;
  }
}

/** Task-level condition (for invoice triggers, only the client conditions apply, against the invoice). */
export function conditionMatches(auto: AutomationWorkflow, task: Task | null, invoice?: Invoice): boolean {
  const c = auto.condition;
  if (!c || !c.field) return true;
  const clientId = invoice?.clientId ?? task?.clientId;
  switch (c.field) {
    case 'clientId':
      return clientId === c.value;
    case 'hasClient':
      return Boolean(clientId);
    case 'groupId':
      return !task || task.groupId === c.value;
    case 'priority':
      return !task || task.priority === c.value;
    case 'tag':
      return !task || Boolean(task.tags?.includes(c.value));
    default:
      return true;
  }
}

/** Overdue tasks this automation hasn't fired for yet (re-fires if the due date changes and passes again). */
export function overdueTasksToFire(auto: AutomationWorkflow, tasks: Task[], today: string) {
  return tasks.filter(
    (t) =>
      !t.archivedAt &&
      t.status !== 'Pronto' &&
      Boolean(t.dueDate) &&
      t.dueDate < today &&
      t.automationRuns?.[auto.id] !== t.dueDate &&
      conditionMatches(auto, t)
  );
}

export function overdueInvoicesToFire(auto: AutomationWorkflow, invoices: Invoice[], today: string) {
  return invoices.filter(
    (i) => i.status === 'sent' && i.dueDate < today && i.automationRuns?.[auto.id] !== i.dueDate && conditionMatches(auto, null, i)
  );
}

/** Tasks billed by an invoice (via its time items) */
export const invoiceTaskIds = (invoice: Invoice) => [
  ...new Set(invoice.items.flatMap((i) => (i.source?.type === 'time' ? [i.source.taskId] : []))),
];

/** Fills {demanda}, {fatura} and {cliente} in action texts. */
export function fillTemplate(text: string, ctx: { task?: Task | null; invoice?: Invoice; client?: Client }) {
  return text
    .replace(/\{demanda\}/g, ctx.task?.title ?? '')
    .replace(/\{fatura\}/g, ctx.invoice?.number ?? '')
    .replace(/\{cliente\}/g, ctx.client?.name ?? '');
}

// --- Human-readable descriptions ("Quando … se … então …") ---

interface Names {
  groups: Group[];
  tags: Tag[];
  clients: Client[];
  members: { id: string; name: string }[];
}

const tagName = (names: Names, id?: string) => names.tags.find((t) => t.id === id)?.name ?? 'etiqueta removida';
const groupName = (names: Names, id?: string) => names.groups.find((g) => g.id === id)?.title ?? 'grupo removido';

export function describeTrigger(auto: AutomationWorkflow, names: Names) {
  const t = normalizeTrigger(auto);
  switch (t.type) {
    case 'STATUS_CHANGE':
      return t.targetStatus ? `o status mudar para "${t.targetStatus}"` : 'o status mudar';
    case 'TASK_CREATED':
      return 'uma demanda for criada';
    case 'PRIORITY_CHANGE':
      return t.targetPriority ? `a prioridade mudar para "${t.targetPriority}"` : 'a prioridade mudar';
    case 'TAG_ADDED':
      return t.tagId ? `a etiqueta "${tagName(names, t.tagId)}" for adicionada` : 'uma etiqueta for adicionada';
    case 'TASK_OVERDUE':
      return 'o prazo de uma demanda vencer';
    case 'TIMER_STOPPED':
      return 'o cronômetro for parado';
    case 'INVOICE_CREATED':
      return 'uma fatura for criada';
    case 'INVOICE_PAID':
      return 'uma fatura for paga';
    case 'INVOICE_OVERDUE':
      return 'uma fatura vencer sem pagamento';
    default:
      return auto.trigger.label;
  }
}

export function describeCondition(auto: AutomationWorkflow, names: Names) {
  const c = auto.condition;
  if (!c || !c.field) return null;
  switch (c.field) {
    case 'groupId':
      return `estiver no grupo "${groupName(names, c.value)}"`;
    case 'priority':
      return `tiver prioridade "${c.value}"`;
    case 'tag':
      return `tiver a etiqueta "${tagName(names, c.value)}"`;
    case 'clientId':
      return `for do cliente "${names.clients.find((x) => x.id === c.value)?.name ?? 'cliente removido'}"`;
    case 'hasClient':
      return 'tiver cliente';
    default:
      return c.label;
  }
}

export function describeAction(auto: AutomationWorkflow, names: Names) {
  const a = auto.action;
  switch (a.type) {
    case 'SET_STATUS':
      return `mudar o status para "${a.targetStatus}"`;
    case 'SET_PRIORITY':
      return `mudar a prioridade para "${a.targetPriority}"`;
    case 'MOVE_TO_GROUP':
      return `mover para o grupo "${groupName(names, a.targetGroupId)}"`;
    case 'ADD_TAG':
      return `adicionar a etiqueta "${tagName(names, a.tagId)}"`;
    case 'ASSIGN_USER':
      return a.assigneeId && a.assigneeId !== 'me'
        ? `atribuir a ${names.members.find((m) => m.id === a.assigneeId)?.name ?? 'membro removido'}`
        : 'atribuir a mim';
    case 'ADD_COMMENT':
      return `comentar "${a.text ?? ''}"`;
    case 'NOTIFY_TEAM':
      return a.text ? `notificar "${a.text}"` : 'notificar';
    case 'START_TIMER':
      return 'iniciar o cronômetro';
    case 'STOP_TIMER':
      return 'parar o cronômetro';
    case 'ARCHIVE_TASK':
      return 'arquivar a demanda';
    case 'CREATE_TASK':
      return `criar a demanda "${a.text ?? ''}"`;
    case 'CREATE_INVOICE_DRAFT':
      return 'criar rascunho de fatura com as horas da demanda';
    default:
      return a.label;
  }
}

export function describeAutomation(auto: AutomationWorkflow, names: Names) {
  const condition = describeCondition(auto, names);
  const subject = triggerScope(auto.trigger.type) === 'invoice' ? 'a fatura' : 'a demanda';
  return `Quando ${describeTrigger(auto, names)}${condition ? `, se ${subject} ${condition}` : ''}, ${describeAction(auto, names)}.`;
}
