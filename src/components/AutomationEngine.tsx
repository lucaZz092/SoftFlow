import { useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { useBilling } from '../context/BillingContext';
import { AutomationChain, AutomationEvent, onAutomationEvent } from '../lib/automationEvents';
import {
  MAX_CHAIN_DEPTH,
  conditionMatches,
  fillTemplate,
  invoiceTaskIds,
  overdueInvoicesToFire,
  overdueTasksToFire,
  triggerMatches,
} from '../lib/automations';
import { timeItems } from '../lib/billing';
import { addDays, localDate } from '../lib/dates';
import { AutomationWorkflow, Invoice, Task } from '../types';

const SCHEDULER_INTERVAL_MS = 5 * 60 * 1000;

/** Thrown to log a run as skipped/failed with a readable reason */
class ActionError extends Error {}

/**
 * Runs automations. Renders nothing.
 * Listens to events from the task and billing contexts (status, kanban moves, priority, tags, timer, invoices),
 * and checks time-based triggers (overdue tasks/invoices) on load and every few minutes.
 */
export const AutomationEngine: React.FC = () => {
  const project = useProject();
  const billing = useBilling();

  // Handlers read the latest context values through refs, so the subscription is set up once
  const latest = useRef({ project, billing });
  latest.current = { project, billing };

  useEffect(() => onAutomationEvent((event) => handleEvent(event)), []);

  // Scheduler for time-based triggers
  const ready = project.isDataLoaded && billing.isLoaded;
  const enabledKey = project.automations
    .filter((a) => a.enabled)
    .map((a) => a.id)
    .join(',');
  useEffect(() => {
    if (!ready) return;
    checkTimeBasedTriggers();
    const id = window.setInterval(checkTimeBasedTriggers, SCHEDULER_INTERVAL_MS);
    return () => window.clearInterval(id);
    // enabledKey re-runs the check as soon as a time-based automation is turned on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, enabledKey]);

  /** Executes one action on one task. Returns a short description for the run log. */
  function runTaskAction(auto: AutomationWorkflow, task: Task | null, chain: AutomationChain, invoice?: Invoice): string {
    const { project: p, billing: b } = latest.current;
    const a = auto.action;
    const client = b.clients.find((c) => c.id === (invoice?.clientId ?? task?.clientId));
    const fill = (text: string) => fillTemplate(text, { task, invoice, client });

    if (a.type === 'CREATE_TASK') {
      const groupId = task?.groupId ?? p.allGroups[0]?.id;
      if (!groupId) throw new ActionError('Nenhum grupo para criar a demanda.');
      const title = fill(a.text?.trim() || 'Acompanhar {demanda}') || 'Acompanhamento';
      const created = p.addTask(groupId, title, { dueDate: addDays(localDate(), a.dueInDays ?? 1), chain });
      if (client) void p.updateTask(created.id, { clientId: client.id });
      return `Demanda "${title}" criada.`;
    }

    if (!task) throw new ActionError('Nenhuma demanda vinculada.');

    switch (a.type) {
      case 'SET_STATUS':
        if (!a.targetStatus) throw new ActionError('Status não definido.');
        p.changeTaskStatus(task.id, a.targetStatus, { chain });
        return `Status de "${task.title}" → ${a.targetStatus}.`;
      case 'SET_PRIORITY':
        if (!a.targetPriority) throw new ActionError('Prioridade não definida.');
        p.changeTaskPriority(task.id, a.targetPriority, { chain });
        return `Prioridade de "${task.title}" → ${a.targetPriority}.`;
      case 'MOVE_TO_GROUP': {
        const group = p.allGroups.find((g) => g.id === a.targetGroupId);
        if (!group) throw new ActionError('O grupo de destino não existe mais.');
        void p.updateTask(task.id, { groupId: group.id });
        return `"${task.title}" movida para ${group.title}.`;
      }
      case 'ADD_TAG': {
        const tag = p.tags.find((t) => t.id === a.tagId);
        if (!tag) throw new ActionError('A etiqueta não existe mais.');
        p.addTaskTag(task.id, tag.id, { chain });
        return `Etiqueta "${tag.name}" em "${task.title}".`;
      }
      case 'ASSIGN_USER': {
        const member = !a.assigneeId || a.assigneeId === 'me' ? p.currentUser : p.members.find((m) => m.id === a.assigneeId);
        if (!member) throw new ActionError('O membro não existe mais.');
        void p.updateTask(task.id, { assignee: member });
        return `"${task.title}" atribuída a ${member.name}.`;
      }
      case 'ADD_COMMENT': {
        const text = fill(a.text?.trim() || '');
        if (!text) throw new ActionError('Comentário vazio.');
        p.addComment(task.id, text, true);
        return `Comentário em "${task.title}".`;
      }
      case 'NOTIFY_TEAM': {
        const text = fill(a.text?.trim() || `${auto.name}: {demanda}`);
        p.addComment(task.id, text, true);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('SoftFlow', { body: text, tag: `${auto.id}:${task.id}` });
        }
        return `Notificação: ${text}`;
      }
      case 'START_TIMER':
        p.startTimer(task.id, { chain });
        return `Cronômetro iniciado em "${task.title}".`;
      case 'STOP_TIMER':
        if (p.runningTimer?.taskId !== task.id) return `Cronômetro de "${task.title}" já estava parado.`;
        p.stopTimer({ chain });
        return `Cronômetro parado em "${task.title}".`;
      case 'ARCHIVE_TASK':
        void p.updateTask(task.id, { archivedAt: new Date().toISOString() });
        return `"${task.title}" arquivada.`;
      case 'CREATE_INVOICE_DRAFT': {
        if (!client) throw new ActionError(`"${task.title}" não tem cliente.`);
        // A timer still running on this task is stopped and billed up to now
        let billable = task;
        if (p.runningTimer?.taskId === task.id) {
          const now = new Date().toISOString();
          p.stopTimer({ chain });
          billable = { ...task, timeEntries: (task.timeEntries ?? []).map((e) => (e.end === null ? { ...e, end: now } : e)) };
        }
        const items = timeItems([billable], client);
        if (items.length === 0) throw new ActionError(`"${task.title}" não tem horas a faturar.`);
        const created = b.createInvoice(
          {
            clientId: client.id,
            issueDate: localDate(),
            dueDate: addDays(localDate(), 15),
            items,
            status: 'draft',
            notes: `Gerada pela automação "${auto.name}".`,
          },
          { chain }
        );
        return `Rascunho da fatura ${created.number} criado para ${client.name}.`;
      }
      default:
        throw new ActionError('Ação não suportada.');
    }
  }

  /** Runs an automation for a task-scoped or invoice-scoped subject and logs the result. */
  function runAutomation(auto: AutomationWorkflow, subject: { task?: Task; invoice?: Invoice }, chain: AutomationChain) {
    const { project: p } = latest.current;
    const logSubject = subject.invoice
      ? { id: subject.invoice.id, title: `Fatura ${subject.invoice.number}` }
      : { id: subject.task!.id, title: subject.task!.title };

    try {
      let details: string;
      if (subject.invoice && auto.action.type !== 'CREATE_TASK') {
        // Invoice triggers act on the tasks the invoice billed
        const tasks = invoiceTaskIds(subject.invoice)
          .map((id) => p.allTasks.find((t) => t.id === id))
          .filter((t): t is Task => Boolean(t) && conditionMatches(auto, t!, subject.invoice));
        if (tasks.length === 0) throw new ActionError('A fatura não tem demandas vinculadas por horas.');
        details = tasks.map((t) => runTaskAction(auto, t, chain, subject.invoice)).join(' ');
      } else {
        details = runTaskAction(auto, subject.task ?? null, chain, subject.invoice);
      }
      p.recordAutomationRun(auto, logSubject, details);
      p.notify(auto.name, details);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      p.recordAutomationRun(auto, logSubject, `Não executada: ${message}`, 'failed');
    }
  }

  function handleEvent(event: AutomationEvent) {
    const { project: p } = latest.current;
    const chain = event.chain ?? { depth: 0, ran: [] };
    if (chain.depth >= MAX_CHAIN_DEPTH) return;

    const candidates = p.automations.filter(
      (a) => (a.enabled || event.type === 'MANUAL') && !chain.ran.includes(a.id) && triggerMatches(a, event)
    );

    for (const auto of candidates) {
      const next: AutomationChain = { depth: chain.depth + 1, ran: [...chain.ran, auto.id] };

      if (event.type === 'MANUAL') {
        const task = p.allTasks.find((t) => t.id === event.taskId);
        if (task) runAutomation(auto, { task }, next);
        continue;
      }
      if (event.type === 'INVOICE_CREATED' || event.type === 'INVOICE_PAID') {
        if (conditionMatches(auto, null, event.invoice)) runAutomation(auto, { invoice: event.invoice }, next);
        continue;
      }
      // Task events carry the updated task snapshot
      if (conditionMatches(auto, event.task)) runAutomation(auto, { task: event.task }, next);
    }
  }

  function checkTimeBasedTriggers() {
    const { project: p, billing: b } = latest.current;
    const today = localDate();
    for (const auto of p.automations.filter((a) => a.enabled)) {
      const chain: AutomationChain = { depth: 1, ran: [auto.id] };
      if (auto.trigger.type === 'TASK_OVERDUE') {
        for (const task of overdueTasksToFire(auto, p.allTasks, today)) {
          p.markTaskAutomationRun(task.id, auto.id, task.dueDate);
          runAutomation(auto, { task }, chain);
        }
      } else if (auto.trigger.type === 'INVOICE_OVERDUE') {
        for (const invoice of overdueInvoicesToFire(auto, b.invoices, today)) {
          b.markInvoiceAutomationRun(invoice.id, auto.id, invoice.dueDate);
          runAutomation(auto, { invoice }, chain);
        }
      }
    }
  }

  return null;
};

