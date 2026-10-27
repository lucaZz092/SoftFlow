export type TaskStatus = 'Pronto' | 'Em andamento' | 'Trabalhando nisso' | 'Parado' | 'Em Revisão' | 'A Fazer' | 'Bloqueado';

export type TaskPriority = 'Crítica' | 'Alta' | 'Média' | 'Baixa' | 'Nenhuma';

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
  initials: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timestamp: string;
  /** Comment written by the app (e.g. by an automation) rather than a person */
  isSystem?: boolean;
}

export interface CustomColumn {
  id: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'link';
}

export interface Task {
  id: string;
  groupId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Assignee | null;
  dueDate: string; // ISO string or YYYY-MM-DD
  timeline: {
    start: string;
    end: string;
  };
  subtasks: Subtask[];
  comments: Comment[];
  customFields?: Record<string, string | number>;
  /** Tag ids (see Tag) */
  tags?: string[];
  /** When set, completing the task creates the next occurrence */
  recurrence?: Recurrence;
  /** Ids of tasks that must be done before this one */
  blockedBy?: string[];
  /** URLs of GitHub pull requests or issues */
  githubLinks?: string[];
  timeEntries?: TimeEntry[];
  attachments?: Attachment[];
  /** Client whose hourly rate applies to this task's time (billing) */
  clientId?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly';
  /** Repeat every N periods */
  interval: number;
}

export interface TimeEntry {
  id: string;
  /** ISO timestamps; `end` is null while the timer is running */
  start: string;
  end: string | null;
  note?: string;
  /** Invoice that billed this entry */
  invoiceId?: string;
}

export interface Attachment {
  id: string;
  name: string;
  /** Path inside the Supabase Storage bucket */
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// --- Billing ---

export interface Client {
  id: string;
  name: string;
  email?: string;
  document?: string;
  /** BRL per hour, for time-based billing */
  hourlyRate: number;
  notes?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate?: string;
  invoiceId?: string;
}

/** Fixed-price project, billed in milestones */
export interface BillingProject {
  id: string;
  clientId: string;
  name: string;
  totalValue: number;
  milestones: Milestone[];
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** What generated this line, so it can be released if the invoice is cancelled */
  source?:
    | { type: 'time'; taskId: string; entryIds: string[] }
    | { type: 'milestone'; projectId: string; milestoneId: string };
}

export interface Invoice {
  id: string;
  /** Sequential number shown to the client, e.g. 2026-007 */
  number: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  title: string;
  color: string;
  collapsed: boolean;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  icon: string;
  groups: Group[];
}

export type AutomationTriggerType =
  | 'STATUS_CHANGE'
  | 'TASK_CREATED'
  | 'PRIORITY_SET_CRITICAL';

export type AutomationActionType =
  | 'SET_STATUS'
  | 'MOVE_TO_GROUP'
  | 'ASSIGN_USER'
  | 'NOTIFY_TEAM';

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: {
    type: AutomationTriggerType;
    label: string;
    targetStatus?: TaskStatus;
  };
  condition?: {
    field: string;
    operator: 'equals' | 'is';
    value: string;
    label: string;
  };
  action: {
    type: AutomationActionType;
    label: string;
    targetStatus?: TaskStatus;
    targetGroupId?: string;
  };
  executionCount: number;
  lastRunAt?: string;
}

export interface AutomationRunLog {
  id: string;
  workflowId: string;
  workflowName: string;
  taskId: string;
  taskTitle: string;
  timestamp: string;
  status: 'success' | 'failed' | 'running';
  details: string;
}

export type ViewType =
  | 'overview'
  | 'table'
  | 'kanban'
  | 'timeline'
  | 'github'
  | 'billing'
  | 'archive'
  | 'automations'
  | 'metrics';
