import { Invoice, Task, TaskPriority, TaskStatus } from '../types';

/**
 * Automation chain metadata: how deep we are in automations triggering automations,
 * and which automations already ran in this chain (each runs at most once per chain).
 */
export interface AutomationChain {
  depth: number;
  ran: string[];
}

export type AutomationEvent = (
  | { type: 'STATUS_CHANGE'; task: Task; from: TaskStatus }
  | { type: 'TASK_CREATED'; task: Task }
  | { type: 'PRIORITY_CHANGE'; task: Task; from: TaskPriority }
  | { type: 'TAG_ADDED'; task: Task; tagId: string }
  | { type: 'TIMER_STOPPED'; task: Task; minutes: number }
  | { type: 'INVOICE_CREATED'; invoice: Invoice }
  | { type: 'INVOICE_PAID'; invoice: Invoice }
  /** "Executar agora" from the automations screen */
  | { type: 'MANUAL'; automationId: string; taskId: string }
) & { chain?: AutomationChain };

type Listener = (event: AutomationEvent) => void;
const listeners = new Set<Listener>();

/** Tiny in-memory bus: the task and billing contexts emit, the automation engine listens. */
export function emitAutomationEvent(event: AutomationEvent) {
  listeners.forEach((l) => l(event));
}

export function onAutomationEvent(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
