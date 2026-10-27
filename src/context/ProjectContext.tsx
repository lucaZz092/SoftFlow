import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Task,
  Group,
  Assignee,
  AutomationWorkflow,
  AutomationRunLog,
  TaskStatus,
  TaskPriority,
  ViewType,
  CustomColumn,
  Tag,
  Attachment,
  Recurrence,
} from '../types';
import { DEFAULT_GROUPS, DEFAULT_AUTOMATIONS, DEFAULT_CUSTOM_COLUMNS } from '../data/defaults';
import { useSyncedCollection } from '../lib/useSyncedCollection';
import { supabase } from '../lib/supabase';
import { toAssignee, useAuth } from './AuthContext';
import { localDate } from '../lib/dates';
import { nextOccurrence } from '../lib/recurrence';
import { parseGithubLink } from '../lib/githubLinks';
import { findRunningEntry } from '../lib/time';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'automation' | 'info';
  timestamp: string;
  action?: { label: string; onClick: () => void };
}

/** A status change waiting for confirmation because the task still has open blockers */
export interface PendingStatusChange {
  taskId: string;
  status: TaskStatus;
  blockers: Task[];
}

export type SortField = 'dueDate' | 'priority' | 'title';
export type GroupByOption = 'group' | 'status' | 'assignee';

interface ProjectContextType {
  /** Active (non-archived) tasks */
  tasks: Task[];
  archivedTasks: Task[];
  /** Every task, archived included */
  allTasks: Task[];
  tags: Tag[];
  groups: Group[];
  automations: AutomationWorkflow[];
  runLogs: AutomationRunLog[];
  isDataLoaded: boolean;
  syncError: string | null;
  currentUser: Assignee;
  members: Assignee[];
  currentView: ViewType;
  selectedTaskId: string | null;
  searchQuery: string;
  filterStatus: string | null;
  filterPriority: string | null;
  filterAssigneeId: string | null;
  filterTagId: string | null;
  toasts: ToastMessage[];
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  pendingStatusChange: PendingStatusChange | null;
  confirmPendingStatusChange: () => void;
  cancelPendingStatusChange: () => void;
  isIntegrationsOpen: boolean;
  isNewAutomationOpen: boolean;

  // Custom Columns & Display Preferences
  customColumns: CustomColumn[];
  hiddenColumns: string[];
  sortBy: { field: SortField; direction: 'asc' | 'desc' } | null;
  groupBy: GroupByOption;
  selectedTaskIds: string[];

  // Theme & Responsiveness
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Actions
  setCurrentView: (view: ViewType) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string | null) => void;
  setFilterPriority: (priority: string | null) => void;
  setFilterAssigneeId: (id: string | null) => void;
  setFilterTagId: (id: string | null) => void;
  setIsIntegrationsOpen: (open: boolean) => void;
  setIsNewAutomationOpen: (open: boolean) => void;
  setSortBy: (sort: { field: SortField; direction: 'asc' | 'desc' } | null) => void;
  setGroupBy: (option: GroupByOption) => void;
  toggleColumnVisibility: (colId: string) => void;

  // Tasks CRUD
  addTask: (groupId: string, title?: string) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => void;
  changeTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  moveTaskToStatus: (taskId: string, newStatus: TaskStatus) => void;
  changeTaskPriority: (taskId: string, newPriority: TaskPriority) => void;
  changeTaskGroup: (taskId: string, newGroupId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addComment: (taskId: string, text: string, isSystem?: boolean) => void;
  /** Upserts whole task objects (used by billing to mark time entries as invoiced) */
  saveTasks: (changed: Task[]) => Promise<void>;

  // Archive
  archiveTask: (taskId: string) => void;
  unarchiveTask: (taskId: string) => void;
  archiveCompleted: () => void;

  // Tags
  addTag: (name: string, color: string) => Tag;
  updateTag: (tagId: string, updates: Partial<Tag>) => void;
  deleteTag: (tagId: string) => void;
  toggleTaskTag: (taskId: string, tagId: string) => void;

  // Recurrence & dependencies
  setRecurrence: (taskId: string, recurrence: Recurrence | undefined) => void;
  addBlocker: (taskId: string, blockerId: string) => void;
  removeBlocker: (taskId: string, blockerId: string) => void;

  // Time tracking
  runningTimer: { taskId: string; start: string } | null;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  addTimeEntry: (taskId: string, entry: { date: string; minutes: number; note?: string }) => void;
  deleteTimeEntry: (taskId: string, entryId: string) => void;

  // GitHub links
  addGithubLink: (taskId: string, url: string) => boolean;
  removeGithubLink: (taskId: string, url: string) => void;

  // Attachments (Supabase Storage)
  uploadAttachment: (taskId: string, file: File) => Promise<void>;
  deleteAttachment: (taskId: string, attachment: Attachment) => Promise<void>;
  getAttachmentUrl: (attachment: Attachment) => Promise<string | null>;

  // Custom Columns CRUD
  addCustomColumn: (title: string, type: CustomColumn['type']) => void;
  removeCustomColumn: (columnId: string) => void;
  updateCustomFieldValue: (taskId: string, columnId: string, value: string | number) => void;

  // Multi-Selection Actions
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasksInGroup: (groupId: string) => void;
  clearTaskSelection: () => void;
  bulkDeleteTasks: () => void;
  bulkSetStatus: (status: TaskStatus) => void;

  // Groups
  toggleGroupCollapse: (groupId: string) => void;
  addGroup: (title: string, color?: string) => void;
  updateGroupTitle: (groupId: string, newTitle: string) => void;
  deleteGroup: (groupId: string) => void;

  // Automations
  toggleAutomation: (workflowId: string) => void;
  addAutomation: (workflow: Omit<AutomationWorkflow, 'id' | 'executionCount' | 'lastRunAt'>) => void;
  deleteAutomation: (workflowId: string) => void;
  triggerManualAutomation: (workflowId: string, targetTaskId?: string) => void;

  // Toast
  dismissToast: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const formatTimestamp = (date = new Date()) =>
  date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const ATTACHMENTS_BUCKET = 'attachments';
const UNDO_WINDOW_MS = 8000;

const byCreatedDesc = (a: Task, b: Task) => b.createdAt.localeCompare(a.createdAt);
const byIdDesc = (a: AutomationRunLog, b: AutomationRunLog) => b.id.localeCompare(a.id);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUser = user!;
  const enabled = Boolean(user);

  const tasksSync = useSyncedCollection<Task>('tasks', { enabled, sort: byCreatedDesc });
  const groupsSync = useSyncedCollection<Group>('groups', { enabled, seed: DEFAULT_GROUPS });
  const automationsSync = useSyncedCollection<AutomationWorkflow>('automations', { enabled, seed: DEFAULT_AUTOMATIONS });
  const runLogsSync = useSyncedCollection<AutomationRunLog>('run_logs', { enabled, sort: byIdDesc, limit: 100 });
  const columnsSync = useSyncedCollection<CustomColumn>('custom_columns', { enabled, seed: DEFAULT_CUSTOM_COLUMNS });
  const tagsSync = useSyncedCollection<Tag>('tags', { enabled });

  const { items: allTasks, setItems: setTasks } = tasksSync;
  const { items: tags, setItems: setTags } = tagsSync;
  const tasks = React.useMemo(() => allTasks.filter((t) => !t.archivedAt), [allTasks]);
  const archivedTasks = React.useMemo(() => allTasks.filter((t) => t.archivedAt), [allTasks]);
  const { items: groups, setItems: setGroups } = groupsSync;
  const { items: automations, setItems: setAutomations } = automationsSync;
  const { items: runLogs, setItems: setRunLogs } = runLogsSync;
  const { items: customColumns, setItems: setCustomColumns } = columnsSync;

  const isDataLoaded = tasksSync.loaded && groupsSync.loaded && automationsSync.loaded;
  const syncError =
    tasksSync.error || groupsSync.error || automationsSync.error || runLogsSync.error || columnsSync.error || tagsSync.error;

  const [members, setMembers] = useState<Assignee[]>([]);

  const [hiddenColumns, setHiddenColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('softflow_hidden_columns');
    return saved ? JSON.parse(saved) : ['timeline'];
  });

  const [sortBy, setSortBy] = useState<{ field: SortField; direction: 'asc' | 'desc' } | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByOption>('group');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);


  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const saved = localStorage.getItem('softflow_current_view') as ViewType | null;
    return saved || 'overview';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('softflow_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterAssigneeId, setFilterAssigneeId] = useState<string | null>(null);
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null);

  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isNewAutomationOpen, setIsNewAutomationOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('softflow_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem('softflow_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('softflow_hidden_columns', JSON.stringify(hiddenColumns));
  }, [hiddenColumns]);

  // Workspace members = everyone who has signed in
  useEffect(() => {
    if (!enabled) return;
    supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .order('name')
      .then(({ data }) => setMembers((data ?? []).map(toAssignee)));
  }, [enabled]);

  const showToast = (
    title: string,
    description: string,
    type: ToastMessage['type'] = 'automation',
    action?: ToastMessage['action']
  ) => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + Math.random().toString(36).substr(2, 4),
      title,
      description,
      type,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      action,
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    window.setTimeout(() => dismissToast(newToast.id), action ? UNDO_WINDOW_MS : 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Preferences & selection ---

  const toggleColumnVisibility = (colId: string) => {
    setHiddenColumns((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
    );
  };

  const addCustomColumn = (title: string, type: CustomColumn['type']) => {
    const newCol: CustomColumn = {
      id: 'col-' + Date.now(),
      title,
      type,
    };
    setCustomColumns((prev) => [...prev, newCol]);
    showToast('Coluna Adicionada', `Nova coluna "${title}" disponível na grade.`, 'info');
  };

  const removeCustomColumn = (columnId: string) => {
    setCustomColumns((prev) => prev.filter((c) => c.id !== columnId));
    showToast('Coluna Removida', 'A coluna customizada foi excluída.', 'info');
  };

  const updateCustomFieldValue = (taskId: string, columnId: string, value: string | number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          customFields: {
            ...t.customFields,
            [columnId]: value,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const selectAllTasksInGroup = (groupId: string) => {
    const groupTaskIds = tasks.filter((t) => t.groupId === groupId).map((t) => t.id);
    const allSelected = groupTaskIds.every((id) => selectedTaskIds.includes(id));
    if (allSelected) {
      setSelectedTaskIds((prev) => prev.filter((id) => !groupTaskIds.includes(id)));
    } else {
      setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...groupTaskIds])));
    }
  };

  const clearTaskSelection = () => {
    setSelectedTaskIds([]);
  };

  const bulkDeleteTasks = () => {
    if (selectedTaskIds.length === 0) return;
    removeTasksWithUndo(selectedTaskIds);
    clearTaskSelection();
  };

  const bulkSetStatus = (status: TaskStatus) => {
    if (selectedTaskIds.length === 0) return;
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (selectedTaskIds.includes(t.id) ? { ...t, status, updatedAt: now } : t))
    );
    showToast('Status Atualizado', `${selectedTaskIds.length} tarefas alteradas para "${status}".`, 'info');
    clearTaskSelection();
  };

  // --- Automations (client-side events) ---

  const recordRunLog = (workflow: AutomationWorkflow, task: Task, details: string) => {
    const now = new Date();
    const newLog: AutomationRunLog = {
      id: `log-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
      workflowId: workflow.id,
      workflowName: workflow.name,
      taskId: task.id,
      taskTitle: task.title,
      timestamp: formatTimestamp(now),
      status: 'success',
      details,
    };
    setRunLogs((prev) => [newLog, ...prev]);

    setAutomations((prev) =>
      prev.map((a) =>
        a.id === workflow.id
          ? { ...a, executionCount: a.executionCount + 1, lastRunAt: formatTimestamp(now) }
          : a
      )
    );
  };

  /** Applies one automation's action to a task and logs the run. */
  const runAutomationAction = (auto: AutomationWorkflow, task: Task) => {
    switch (auto.action.type) {
      case 'NOTIFY_TEAM':
        addComment(task.id, `Automação "${auto.name}": demanda sinalizada.`, true);
        recordRunLog(auto, task, 'Alerta registrado na demanda.');
        showToast('Alerta de Fluxo', `Demanda "${task.title}" escalada para a equipe.`, 'info');
        break;
      case 'SET_STATUS':
      case 'MOVE_TO_GROUP': {
        const updates: Partial<Task> = {};
        if (auto.action.targetStatus) updates.status = auto.action.targetStatus;
        if (auto.action.targetGroupId && groups.some((g) => g.id === auto.action.targetGroupId)) {
          updates.groupId = auto.action.targetGroupId;
        }
        updateTask(task.id, updates);
        recordRunLog(auto, task, `Ação "${auto.action.label}" aplicada.`);
        showToast('Fluxo Executado', `Automação "${auto.name}" aplicada a "${task.title}".`, 'automation');
        break;
      }
      default:
        break;
    }
  };

  const executeAutomationsForEvent = (
    triggerType: 'STATUS_CHANGE' | 'TASK_CREATED' | 'PRIORITY_SET_CRITICAL',
    task: Task
  ) => {
    automations.forEach((auto) => {
      if (!auto.enabled || auto.trigger.type !== triggerType) return;
      if (triggerType === 'STATUS_CHANGE' && auto.trigger.targetStatus && task.status !== auto.trigger.targetStatus) return;
      if (auto.condition?.field === 'groupId' && task.groupId !== auto.condition.value) return;
      runAutomationAction(auto, task);
    });
  };

  // --- Tasks ---

  const addTask = (groupId: string, title?: string): Task => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: 'task-' + Date.now(),
      groupId,
      title: title || 'Nova Demanda',
      description: '',
      status: 'A Fazer',
      priority: 'Média',
      assignee: currentUser,
      dueDate: localDate(3),
      timeline: {
        start: localDate(0),
        end: localDate(3),
      },
      subtasks: [],
      comments: [],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    };

    void setTasks((prev) => [newTask, ...prev]).then(() => executeAutomationsForEvent('TASK_CREATED', newTask));

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );

  /** Upserts whole task objects by id. */
  const saveTasks = (changed: Task[]) => {
    const byId = new Map(changed.map((t) => [t.id, t]));
    return setTasks((prev) => prev.map((t) => byId.get(t.id) ?? t));
  };

  // Attachment files of deleted tasks are only removed once the undo window has passed
  const pendingDeletions = useRef(new Map<string, number>());

  /** Deletes tasks right away, with an "Desfazer" toast that puts them back. */
  const removeTasksWithUndo = (ids: string[]) => {
    const removed = allTasks.filter((t) => ids.includes(t.id));
    if (removed.length === 0) return;
    void setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
    if (selectedTaskId && ids.includes(selectedTaskId)) setSelectedTaskId(null);

    const key = ids.join(',');
    const files = removed.flatMap((t) => (t.attachments ?? []).map((a) => a.path));
    if (files.length > 0) {
      const timer = window.setTimeout(() => {
        pendingDeletions.current.delete(key);
        void supabase.storage.from(ATTACHMENTS_BUCKET).remove(files);
      }, UNDO_WINDOW_MS);
      pendingDeletions.current.set(key, timer);
    }

    showToast(
      removed.length === 1 ? 'Demanda excluída' : `${removed.length} demandas excluídas`,
      removed.length === 1 ? `"${removed[0].title}" foi excluída.` : 'As demandas selecionadas foram excluídas.',
      'info',
      {
        label: 'Desfazer',
        onClick: () => {
          window.clearTimeout(pendingDeletions.current.get(key));
          pendingDeletions.current.delete(key);
          void setTasks((prev) => [...removed, ...prev.filter((t) => !ids.includes(t.id))]);
        },
      }
    );
  };

  const deleteTask = (taskId: string) => removeTasksWithUndo([taskId]);

  const openBlockers = (task: Task) =>
    (task.blockedBy ?? [])
      .map((id) => allTasks.find((t) => t.id === id))
      .filter((t): t is Task => Boolean(t) && t!.status !== 'Pronto');

  const applyStatusChange = (task: Task, newStatus: TaskStatus) => {
    const updated = { ...task, status: newStatus, updatedAt: new Date().toISOString() };

    // Completing a recurring task schedules the next one; the recurrence moves to the new task
    let next: Task | null = null;
    if (newStatus === 'Pronto' && task.recurrence) {
      next = nextOccurrence(task, 'task-' + Date.now());
      updated.recurrence = undefined;
    }

    void setTasks((prev) => {
      const list = prev.map((t) => (t.id === task.id ? updated : t));
      return next ? [next, ...list] : list;
    }).then(() => executeAutomationsForEvent('STATUS_CHANGE', updated));

    if (next) showToast('Próxima ocorrência criada', `"${next.title}" agendada para ${next.dueDate.split('-').reverse().join('/')}.`, 'info');
  };

  const changeTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const blockers = newStatus === 'Pronto' ? openBlockers(task) : [];
    if (blockers.length > 0) {
      setPendingStatusChange({ taskId, status: newStatus, blockers });
      return;
    }
    applyStatusChange(task, newStatus);
  };

  const confirmPendingStatusChange = () => {
    if (!pendingStatusChange) return;
    const task = allTasks.find((t) => t.id === pendingStatusChange.taskId);
    if (task) applyStatusChange(task, pendingStatusChange.status);
    setPendingStatusChange(null);
  };

  const cancelPendingStatusChange = () => setPendingStatusChange(null);

  // --- Archive ---

  const archiveTask = (taskId: string) => {
    void updateTask(taskId, { archivedAt: new Date().toISOString() });
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    showToast('Demanda arquivada', 'Ela fica disponível na tela Arquivo.', 'info', {
      label: 'Desfazer',
      onClick: () => void updateTask(taskId, { archivedAt: undefined }),
    });
  };

  const unarchiveTask = (taskId: string) => {
    void updateTask(taskId, { archivedAt: undefined });
    showToast('Demanda restaurada', 'A demanda voltou para o quadro.', 'info');
  };

  const archiveCompleted = () => {
    const done = tasks.filter((t) => t.status === 'Pronto').map((t) => t.id);
    if (done.length === 0) {
      showToast('Nada para arquivar', 'Não há demandas concluídas no quadro.', 'info');
      return;
    }
    const now = new Date().toISOString();
    void setTasks((prev) => prev.map((t) => (done.includes(t.id) ? { ...t, archivedAt: now, updatedAt: now } : t)));
    showToast(`${done.length} demandas arquivadas`, 'As concluídas saíram do quadro.', 'info', {
      label: 'Desfazer',
      onClick: () =>
        void setTasks((prev) => prev.map((t) => (done.includes(t.id) ? { ...t, archivedAt: undefined } : t))),
    });
  };

  // --- Tags ---

  const addTag = (name: string, color: string): Tag => {
    const tag: Tag = { id: 'tag-' + Date.now(), name: name.trim(), color };
    void setTags((prev) => [...prev, tag]);
    return tag;
  };

  const updateTag = (tagId: string, updates: Partial<Tag>) =>
    void setTags((prev) => prev.map((t) => (t.id === tagId ? { ...t, ...updates } : t)));

  const deleteTag = (tagId: string) => {
    void setTags((prev) => prev.filter((t) => t.id !== tagId));
    void setTasks((prev) =>
      prev.map((t) => (t.tags?.includes(tagId) ? { ...t, tags: t.tags.filter((id) => id !== tagId) } : t))
    );
    if (filterTagId === tagId) setFilterTagId(null);
  };

  const toggleTaskTag = (taskId: string, tagId: string) =>
    void setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const current = t.tags ?? [];
        const next = current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId];
        return { ...t, tags: next, updatedAt: new Date().toISOString() };
      })
    );

  // --- Recurrence & dependencies ---

  const setRecurrence = (taskId: string, recurrence: Recurrence | undefined) =>
    void updateTask(taskId, { recurrence });

  /** Would making `taskId` wait on `blockerId` create a cycle? */
  const createsCycle = (taskId: string, blockerId: string) => {
    const seen = new Set<string>();
    const stack = [blockerId];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (id === taskId) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      stack.push(...(allTasks.find((t) => t.id === id)?.blockedBy ?? []));
    }
    return false;
  };

  const addBlocker = (taskId: string, blockerId: string) => {
    if (taskId === blockerId) return;
    if (createsCycle(taskId, blockerId)) {
      showToast('Dependência circular', 'Essa dependência faria as duas demandas esperarem uma pela outra.', 'info');
      return;
    }
    const task = allTasks.find((t) => t.id === taskId);
    if (!task || task.blockedBy?.includes(blockerId)) return;
    void updateTask(taskId, { blockedBy: [...(task.blockedBy ?? []), blockerId] });
  };

  const removeBlocker = (taskId: string, blockerId: string) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;
    void updateTask(taskId, { blockedBy: (task.blockedBy ?? []).filter((id) => id !== blockerId) });
  };

  // --- Time tracking ---

  const running = findRunningEntry(allTasks);
  const runningTimer = running ? { taskId: running.task.id, start: running.entry.start } : null;

  /** Closes any running entry; returns the updated list */
  const withTimerStopped = (list: Task[], now: string) =>
    list.map((t) =>
      t.timeEntries?.some((e) => e.end === null)
        ? { ...t, timeEntries: t.timeEntries.map((e) => (e.end === null ? { ...e, end: now } : e)), updatedAt: now }
        : t
    );

  // Starting a timer stops the previous one in the same update, so only one runs at a time
  const startTimer = (taskId: string) => {
    const now = new Date().toISOString();
    void setTasks((prev) =>
      withTimerStopped(prev, now).map((t) =>
        t.id === taskId
          ? { ...t, timeEntries: [...(t.timeEntries ?? []), { id: 'time-' + Date.now(), start: now, end: null }], updatedAt: now }
          : t
      )
    );
  };

  const stopTimer = () => void setTasks((prev) => withTimerStopped(prev, new Date().toISOString()));

  const addTimeEntry = (taskId: string, entry: { date: string; minutes: number; note?: string }) => {
    // Manual entries start at noon of the chosen day so the date never shifts across timezones
    const [y, m, d] = entry.date.split('-').map(Number);
    const start = new Date(y, m - 1, d, 12, 0, 0);
    const end = new Date(start.getTime() + entry.minutes * 60000);
    void setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              timeEntries: [
                ...(t.timeEntries ?? []),
                { id: 'time-' + Date.now(), start: start.toISOString(), end: end.toISOString(), note: entry.note?.trim() || undefined },
              ],
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const deleteTimeEntry = (taskId: string, entryId: string) => {
    const entry = allTasks.find((t) => t.id === taskId)?.timeEntries?.find((e) => e.id === entryId);
    if (entry?.invoiceId) {
      showToast('Lançamento faturado', 'Cancele a fatura antes de excluir este lançamento.', 'info');
      return;
    }
    void setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, timeEntries: (t.timeEntries ?? []).filter((e) => e.id !== entryId) } : t
      )
    );
  };

  // --- GitHub links ---

  const addGithubLink = (taskId: string, url: string) => {
    const parsed = parseGithubLink(url);
    if (!parsed) {
      showToast('Link inválido', 'Use o link de um PR ou issue do GitHub.', 'info');
      return false;
    }
    const task = allTasks.find((t) => t.id === taskId);
    if (!task || task.githubLinks?.includes(parsed.url)) return true;
    void updateTask(taskId, { githubLinks: [...(task.githubLinks ?? []), parsed.url] });
    return true;
  };

  const removeGithubLink = (taskId: string, url: string) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;
    void updateTask(taskId, { githubLinks: (task.githubLinks ?? []).filter((u) => u !== url) });
  };

  // --- Attachments ---

  const uploadAttachment = async (taskId: string, file: File) => {
    const safeName = file.name.normalize('NFD').replace(/[^\w.-]+/g, '_');
    const path = `${taskId}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file, { contentType: file.type });
    if (error) {
      showToast('Falha no envio', error.message, 'info');
      return;
    }
    const attachment: Attachment = {
      id: 'att-' + Date.now(),
      name: file.name,
      path,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };
    await setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, attachments: [...(t.attachments ?? []), attachment] } : t))
    );
  };

  const deleteAttachment = async (taskId: string, attachment: Attachment) => {
    const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).remove([attachment.path]);
    if (error) {
      showToast('Falha ao excluir anexo', error.message, 'info');
      return;
    }
    await setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, attachments: (t.attachments ?? []).filter((a) => a.id !== attachment.id) } : t
      )
    );
  };

  /** Short-lived signed URL, since the bucket is private */
  const getAttachmentUrl = async (attachment: Attachment) => {
    const { data, error } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .createSignedUrl(attachment.path, 60, { download: attachment.name });
    if (error) {
      showToast('Falha ao abrir anexo', error.message, 'info');
      return null;
    }
    return data.signedUrl;
  };

  const moveTaskToStatus = (taskId: string, newStatus: TaskStatus) => {
    changeTaskStatus(taskId, newStatus);
  };

  const changeTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.priority === newPriority) return;

    void updateTask(taskId, { priority: newPriority }).then(() => {
      if (newPriority === 'Crítica') {
        executeAutomationsForEvent('PRIORITY_SET_CRITICAL', { ...task, priority: newPriority });
      }
    });
  };

  const changeTaskGroup = (taskId: string, newGroupId: string) => {
    updateTask(taskId, { groupId: newGroupId });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: [...t.subtasks, { id: 'sub-' + Date.now(), title, completed: false }],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addComment = (taskId: string, text: string, isSystem: boolean = false) => {
    if (!text.trim()) return;
    const newComment = {
      id: 'comm-' + Date.now(),
      author: isSystem ? 'SoftFlow' : currentUser.name,
      avatar: isSystem ? undefined : currentUser.avatar,
      text,
      timestamp: formatTimestamp(),
      isSystem,
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() } : t
      )
    );
  };

  // --- Groups ---

  const toggleGroupCollapse = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g))
    );
  };

  const addGroup = (title: string, color: string = '#579bfc') => {
    if (!title.trim()) return;
    const newGroup: Group = {
      id: 'group-' + Date.now(),
      title,
      color,
      collapsed: false,
    };
    setGroups((prev) => [...prev, newGroup]);
    showToast('Novo Grupo Criado', `Grupo "${title}" adicionado ao quadro.`, 'info');
  };

  const updateGroupTitle = (groupId: string, newTitle: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title: newTitle } : g))
    );
  };

  const deleteGroup = (groupId: string) => {
    const remaining = groups.filter((g) => g.id !== groupId);
    if (remaining.length > 0) {
      setTasks((prev) =>
        prev.map((t) => (t.groupId === groupId ? { ...t, groupId: remaining[0].id } : t))
      );
    }
    setGroups(remaining);
    showToast('Grupo Removido', 'O grupo e suas associações foram atualizados.', 'info');
  };

  // --- Automation management ---

  const toggleAutomation = (workflowId: string) => {
    const target = automations.find((a) => a.id === workflowId);
    if (!target) return;
    const nextState = !target.enabled;
    setAutomations((prev) => prev.map((a) => (a.id === workflowId ? { ...a, enabled: nextState } : a)));
    showToast(
      nextState ? 'Fluxo Ativado' : 'Fluxo Pausado',
      `O fluxo "${target.name}" foi ${nextState ? 'ativado' : 'pausado'}.`,
      'automation'
    );
  };

  const addAutomation = (workflowData: Omit<AutomationWorkflow, 'id' | 'executionCount' | 'lastRunAt'>) => {
    const newAuto: AutomationWorkflow = {
      ...workflowData,
      id: 'auto-' + Date.now(),
      executionCount: 0,
      lastRunAt: 'Nunca executado',
    };
    setAutomations((prev) => [newAuto, ...prev]);
    showToast('Novo Fluxo Criado', `Automação "${newAuto.name}" adicionada e ativa.`, 'automation');
  };

  const deleteAutomation = (workflowId: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== workflowId));
    showToast('Fluxo Excluído', 'A automação foi removida.', 'info');
  };

  /** Runs an automation's action right now on a task (the most recent one if none is given). */
  const triggerManualAutomation = (workflowId: string, targetTaskId?: string) => {
    const wf = automations.find((a) => a.id === workflowId);
    if (!wf) return;

    const task = targetTaskId ? allTasks.find((t) => t.id === targetTaskId) : tasks[0];
    if (!task) {
      showToast('Nenhuma demanda', 'Crie uma demanda para executar a automação.', 'info');
      return;
    }
    runAutomationAction(wf, task);
  };

  return (
    <ProjectContext.Provider
      value={{
        theme,
        toggleTheme,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        tasks,
        archivedTasks,
        allTasks,
        tags,
        groups,
        automations,
        runLogs,
        isDataLoaded,
        syncError,
        currentUser,
        members,
        currentView,
        selectedTaskId,
        searchQuery,
        filterStatus,
        filterPriority,
        filterAssigneeId,
        filterTagId,
        toasts,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        pendingStatusChange,
        confirmPendingStatusChange,
        cancelPendingStatusChange,
        isIntegrationsOpen,
        isNewAutomationOpen,
        customColumns,
        hiddenColumns,
        sortBy,
        groupBy,
        selectedTaskIds,
        setCurrentView,
        setSelectedTaskId,
        setSearchQuery,
        setFilterStatus,
        setFilterPriority,
        setFilterAssigneeId,
        setFilterTagId,
        setIsIntegrationsOpen,
        setIsNewAutomationOpen,
        setSortBy,
        setGroupBy,
        toggleColumnVisibility,
        addTask,
        updateTask,
        deleteTask,
        changeTaskStatus,
        moveTaskToStatus,
        changeTaskPriority,
        changeTaskGroup,
        toggleSubtask,
        addSubtask,
        addComment,
        saveTasks,
        archiveTask,
        unarchiveTask,
        archiveCompleted,
        addTag,
        updateTag,
        deleteTag,
        toggleTaskTag,
        setRecurrence,
        addBlocker,
        removeBlocker,
        runningTimer,
        startTimer,
        stopTimer,
        addTimeEntry,
        deleteTimeEntry,
        addGithubLink,
        removeGithubLink,
        uploadAttachment,
        deleteAttachment,
        getAttachmentUrl,
        addCustomColumn,
        removeCustomColumn,
        updateCustomFieldValue,
        toggleTaskSelection,
        selectAllTasksInGroup,
        clearTaskSelection,
        bulkDeleteTasks,
        bulkSetStatus,
        toggleGroupCollapse,
        addGroup,
        updateGroupTitle,
        deleteGroup,
        toggleAutomation,
        addAutomation,
        deleteAutomation,
        triggerManualAutomation,
        dismissToast,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
