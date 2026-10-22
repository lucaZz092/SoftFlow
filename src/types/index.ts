export type TaskStatus = 'Pronto' | 'Em andamento' | 'Parado' | 'Em Revisão' | 'A Fazer' | 'Bloqueado';

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
  isAi?: boolean;
  aiModel?: 'Claude' | 'Codex' | 'GitHub' | 'System';
}

export interface GitHubIntegrationData {
  repo: string;
  branch?: string;
  prNumber?: number;
  prTitle?: string;
  prStatus?: 'open' | 'merged' | 'draft' | 'closed';
  commitsCount?: number;
  checksPassing?: boolean;
}

export interface ClaudeIntegrationData {
  refinedAt?: string;
  userStory?: string;
  acceptanceCriteria?: string[];
  complexityScore?: 'P' | 'M' | 'G' | 'GG';
  estimatedHours?: number;
  summary?: string;
}

export interface CodexIntegrationData {
  lastRunAt?: string;
  codeSnippet?: string;
  generatedTests?: string;
  reviewScore?: number;
  reviewSummary?: string;
  testsPassing?: boolean;
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
  integrations: {
    github?: GitHubIntegrationData;
    claude?: ClaudeIntegrationData;
    codex?: CodexIntegrationData;
  };
  createdAt: string;
  updatedAt: string;
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
  | 'GITHUB_PR_MERGED'
  | 'GITHUB_PR_OPENED'
  | 'TASK_CREATED'
  | 'PRIORITY_SET_CRITICAL'
  | 'CODEX_TEST_PASS'
  | 'CLAUDE_REFINE_REQUEST';

export type AutomationActionType =
  | 'CLAUDE_REFINE'
  | 'CODEX_GENERATE_TESTS'
  | 'GITHUB_CREATE_BRANCH'
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
    integrationIcon?: 'claude' | 'codex' | 'github' | 'monday';
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
  integrationType: 'Claude' | 'Codex' | 'GitHub' | 'Workflow';
}

export type ViewType = 'table' | 'kanban' | 'timeline' | 'automations' | 'metrics';
