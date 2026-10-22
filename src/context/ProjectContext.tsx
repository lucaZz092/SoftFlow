import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Task,
  Group,
  Assignee,
  AutomationWorkflow,
  AutomationRunLog,
  TaskStatus,
  TaskPriority,
  ViewType,
} from '../types';
import {
  INITIAL_TASKS,
  INITIAL_GROUPS,
  INITIAL_AUTOMATIONS,
  INITIAL_RUN_LOGS,
  CURRENT_USER,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'automation' | 'github' | 'claude' | 'codex' | 'info';
  timestamp: string;
}

interface ProjectContextType {
  tasks: Task[];
  groups: Group[];
  automations: AutomationWorkflow[];
  runLogs: AutomationRunLog[];
  currentView: ViewType;
  selectedTaskId: string | null;
  searchQuery: string;
  filterStatus: string | null;
  filterPriority: string | null;
  filterAssigneeId: string | null;
  toasts: ToastMessage[];
  isIntegrationsOpen: boolean;
  isNewAutomationOpen: boolean;
  isAiModalOpen: boolean;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string | null) => void;
  setFilterPriority: (priority: string | null) => void;
  setFilterAssigneeId: (id: string | null) => void;
  setIsIntegrationsOpen: (open: boolean) => void;
  setIsNewAutomationOpen: (open: boolean) => void;
  setIsAiModalOpen: (open: boolean) => void;
  
  // Tasks CRUD
  addTask: (groupId: string, title?: string) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  changeTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  changeTaskPriority: (taskId: string, newPriority: TaskPriority) => void;
  changeTaskGroup: (taskId: string, newGroupId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addComment: (taskId: string, text: string, isAi?: boolean, aiModel?: 'Claude' | 'Codex' | 'GitHub' | 'System') => void;
  
  // Groups
  toggleGroupCollapse: (groupId: string) => void;
  addGroup: (title: string, color?: string) => void;
  updateGroupTitle: (groupId: string, newTitle: string) => void;
  deleteGroup: (groupId: string) => void;
  
  // Automations & Integrations
  toggleAutomation: (workflowId: string) => void;
  addAutomation: (workflow: Omit<AutomationWorkflow, 'id' | 'executionCount' | 'lastRunAt'>) => void;
  deleteAutomation: (workflowId: string) => void;
  triggerManualAutomation: (workflowId: string, targetTaskId?: string) => void;
  
  // Live Simulation Triggers
  simulateGitHubEvent: (eventType: 'PR_MERGED' | 'PR_OPENED' | 'PUSH', taskId?: string) => void;
  simulateClaudeRefine: (taskId: string) => void;
  simulateCodexTestGeneration: (taskId: string) => void;
  
  // Toast
  dismissToast: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('softflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('softflow_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [automations, setAutomations] = useState<AutomationWorkflow[]>(() => {
    const saved = localStorage.getItem('softflow_automations');
    return saved ? JSON.parse(saved) : INITIAL_AUTOMATIONS;
  });

  const [runLogs, setRunLogs] = useState<AutomationRunLog[]>(() => {
    const saved = localStorage.getItem('softflow_run_logs');
    return saved ? JSON.parse(saved) : INITIAL_RUN_LOGS;
  });

  const [currentView, setCurrentView] = useState<ViewType>('table');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterAssigneeId, setFilterAssigneeId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isNewAutomationOpen, setIsNewAutomationOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('softflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('softflow_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('softflow_automations', JSON.stringify(automations));
  }, [automations]);

  useEffect(() => {
    localStorage.setItem('softflow_run_logs', JSON.stringify(runLogs));
  }, [runLogs]);

  const showToast = (title: string, description: string, type: ToastMessage['type'] = 'automation') => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + Math.random().toString(36).substr(2, 4),
      title,
      description,
      type,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const recordRunLog = (
    workflowId: string,
    workflowName: string,
    taskId: string,
    taskTitle: string,
    details: string,
    integrationType: 'Claude' | 'Codex' | 'GitHub' | 'Workflow'
  ) => {
    const newLog: AutomationRunLog = {
      id: 'log-' + Date.now(),
      workflowId,
      workflowName,
      taskId,
      taskTitle,
      timestamp: 'Agora mesmo',
      status: 'success',
      details,
      integrationType,
    };
    setRunLogs((prev) => [newLog, ...prev]);

    // Update execution counter
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === workflowId
          ? {
              ...a,
              executionCount: a.executionCount + 1,
              lastRunAt: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            }
          : a
      )
    );
  };

  // Process task-triggered automations
  const executeAutomationsForEvent = (
    triggerType: 'STATUS_CHANGE' | 'TASK_CREATED' | 'PRIORITY_SET_CRITICAL',
    task: Task,
    previousState?: Partial<Task>
  ) => {
    automations.forEach((auto) => {
      if (!auto.enabled) return;

      // Condition check
      if (auto.trigger.type === triggerType) {
        let matches = true;

        if (triggerType === 'STATUS_CHANGE' && auto.trigger.targetStatus) {
          if (task.status !== auto.trigger.targetStatus) {
            matches = false;
          }
        }

        if (auto.condition) {
          if (auto.condition.field === 'groupId' && task.groupId !== auto.condition.value) {
            matches = false;
          }
        }

        if (matches) {
          // Execute Action
          if (auto.action.type === 'CODEX_GENERATE_TESTS') {
            simulateCodexTestGeneration(task.id, auto);
          } else if (auto.action.type === 'CLAUDE_REFINE') {
            simulateClaudeRefine(task.id, auto);
          } else if (auto.action.type === 'GITHUB_CREATE_BRANCH') {
            const branchName = `feature/${task.id}-${task.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`;
            updateTask(task.id, {
              integrations: {
                ...task.integrations,
                github: {
                  repo: task.integrations.github?.repo || 'preventsenior/soft-solutions-core',
                  branch: branchName,
                  prStatus: 'draft',
                  commitsCount: 1,
                  checksPassing: true,
                },
              },
            });
            recordRunLog(
              auto.id,
              auto.name,
              task.id,
              task.title,
              `Branch "${branchName}" criada no GitHub via automação.`,
              'GitHub'
            );
            showToast('GitHub: Branch Criada', `Branch "${branchName}" gerada para a demanda "${task.title}".`, 'github');
          } else if (auto.action.type === 'NOTIFY_TEAM') {
            addComment(task.id, `🚨 Alerta de Escalada: Demanda marcada com prioridade crítica ou bloqueio. Equipe notificada.`, true, 'System');
            recordRunLog(
              auto.id,
              auto.name,
              task.id,
              task.title,
              `Notificação de bloqueio enviada à equipe de engenharia e liderança.`,
              'Workflow'
            );
            showToast('Alerta de Fluxo', `Demanda "${task.title}" escalada para o time de suporte/engenharia.`, 'info');
          }
        }
      }
    });
  };

  const addTask = (groupId: string, title?: string): Task => {
    const newTask: Task = {
      id: 'task-' + Date.now(),
      groupId,
      title: title || 'Nova Demanda',
      description: 'Adicione detalhes e critérios de aceite para esta demanda.',
      status: 'A Fazer',
      priority: 'Média',
      assignee: CURRENT_USER,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      timeline: {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      },
      subtasks: [],
      comments: [
        {
          id: 'c-' + Date.now(),
          author: 'Sistema',
          timestamp: 'Agora',
          text: 'Demanda criada.',
        },
      ],
      integrations: {
        github: {
          repo: 'preventsenior/soft-solutions-core',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    // Check TASK_CREATED automations
    setTimeout(() => {
      executeAutomationsForEvent('TASK_CREATED', newTask);
    }, 200);

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    showToast('Demanda Removida', 'A demanda foi excluída com sucesso.', 'info');
  };

  const changeTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const updatedTask = { ...task, status: newStatus };
    updateTask(taskId, { status: newStatus });

    // Trigger automations
    executeAutomationsForEvent('STATUS_CHANGE', updatedTask);
  };

  const changeTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.priority === newPriority) return;

    const updatedTask = { ...task, priority: newPriority };
    updateTask(taskId, { priority: newPriority });

    if (newPriority === 'Crítica') {
      executeAutomationsForEvent('PRIORITY_SET_CRITICAL', updatedTask);
    }
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
        };
      })
    );
  };

  const addComment = (
    taskId: string,
    text: string,
    isAi: boolean = false,
    aiModel: 'Claude' | 'Codex' | 'GitHub' | 'System' = 'System'
  ) => {
    if (!text.trim()) return;
    const newComment = {
      id: 'comm-' + Date.now(),
      author: isAi ? aiModel : CURRENT_USER.name,
      avatar: isAi ? undefined : CURRENT_USER.avatar,
      text,
      timestamp: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isAi,
      aiModel,
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t))
    );
  };

  // Group operations
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
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    // Move tasks in deleted group to first available group
    const remaining = groups.filter((g) => g.id !== groupId);
    if (remaining.length > 0) {
      setTasks((prev) =>
        prev.map((t) => (t.groupId === groupId ? { ...t, groupId: remaining[0].id } : t))
      );
    }
    showToast('Grupo Removido', 'O grupo e suas associações foram atualizados.', 'info');
  };

  // Automation operations
  const toggleAutomation = (workflowId: string) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id !== workflowId) return a;
        const nextState = !a.enabled;
        showToast(
          nextState ? 'Fluxo Ativado' : 'Fluxo Pausado',
          `O fluxo "${a.name}" foi ${nextState ? 'ativado' : 'pausado'}.`,
          'automation'
        );
        return { ...a, enabled: nextState };
      })
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

  // Simulators & AI Actions
  const simulateCodexTestGeneration = (taskId: string, workflow?: AutomationWorkflow) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const wf = workflow || automations.find((a) => a.id === 'auto-2') || automations[0];

    const generatedCode = `// Generated by Codex AI - Unit Test Suite for ${task.title}
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('${task.title}', () => {
  it('should initialize with default states correctly', async () => {
    const mockHandler = vi.fn();
    expect(true).toBe(true);
  });

  it('should validate inputs and handle edge error cases gracefully', async () => {
    // Verified 100% boundary conditions
    expect(mockValidate()).resolves.toBeDefined();
  });
});`;

    const reviewSummary = `Score de Qualidade 96/100: Cobertura de cenários de erro, validação de tipos rigorosa e sem vazamento de memória.`;

    updateTask(taskId, {
      integrations: {
        ...task.integrations,
        codex: {
          lastRunAt: new Date().toISOString(),
          codeSnippet: `export const executeTaskFlow = async (id: string) => {\n  // Implementação gerada pelo Codex\n  return { success: true, timestamp: Date.now() };\n};`,
          generatedTests: generatedCode,
          reviewScore: 96,
          reviewSummary,
          testsPassing: true,
        },
      },
      subtasks:
        task.subtasks.length > 0
          ? task.subtasks
          : [
              { id: 'st-codex-1', title: 'Testes unitários aprovados (Codex)', completed: true },
              { id: 'st-codex-2', title: 'Validação de lint e tipagem estrita', completed: true },
            ],
    });

    addComment(
      taskId,
      `⚡ Codex gerou testes unitários com sucesso (Score 96/100). Cobertura garantida.`,
      true,
      'Codex'
    );

    recordRunLog(
      wf.id,
      wf.name,
      task.id,
      task.title,
      `Codex gerou suite de testes completa e realizou code review estático na demanda "${task.title}".`,
      'Codex'
    );

    showToast('Codex: Testes Gerados', `Suite de testes gerada com 96% de score para "${task.title}".`, 'codex');
  };

  const simulateClaudeRefine = (taskId: string, workflow?: AutomationWorkflow) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const wf = workflow || automations.find((a) => a.id === 'auto-3') || automations[0];

    const userStory = `Como usuário da plataforma, preciso de "${task.title}" para garantir máxima produtividade no fluxo de entrega contínua.`;
    const criteria = [
      `Garantir tempo de resposta inferior a 250ms`,
      `Tratar estados de erro com feedback visual intuitivo`,
      `Validar permissões de acesso do usuário solicitante`,
      `Emitir evento de telemetria após conclusão com sucesso`,
    ];

    updateTask(taskId, {
      integrations: {
        ...task.integrations,
        claude: {
          refinedAt: new Date().toISOString(),
          userStory,
          acceptanceCriteria: criteria,
          complexityScore: 'M',
          estimatedHours: 6,
          summary: `Refinamento estruturado gerado pelo Claude. 4 critérios de aceite identificados.`,
        },
      },
      subtasks: [
        ...task.subtasks,
        { id: 'claude-1', title: 'Implementar validação de permissões', completed: false },
        { id: 'claude-2', title: 'Adicionar feedback de erro visual', completed: false },
      ],
    });

    addComment(
      taskId,
      `🤖 Claude refinou esta demanda: Adicionados critérios de aceite detalhados e estimativa de 6h (Complexidade M).`,
      true,
      'Claude'
    );

    recordRunLog(
      wf.id,
      wf.name,
      task.id,
      task.title,
      `Claude realizou decomposição da demanda em 4 critérios de aceite e gerou 2 sub-tarefas.`,
      'Claude'
    );

    showToast('Claude: Demanda Refinada', `Critérios de aceite e sub-tarefas gerados para "${task.title}".`, 'claude');
  };

  const simulateGitHubEvent = (eventType: 'PR_MERGED' | 'PR_OPENED' | 'PUSH', targetTaskId?: string) => {
    // Pick the target task or the first task with an open PR
    const task = targetTaskId
      ? tasks.find((t) => t.id === targetTaskId)
      : tasks.find((t) => t.integrations.github?.prStatus === 'open') || tasks[0];

    if (!task) return;

    if (eventType === 'PR_MERGED') {
      const prNumber = task.integrations.github?.prNumber || 42;
      const doneGroup = groups.find((g) => g.id === 'group-concluido') || groups[groups.length - 1];

      updateTask(task.id, {
        status: 'Pronto',
        groupId: doneGroup.id,
        integrations: {
          ...task.integrations,
          github: {
            ...task.integrations.github,
            repo: task.integrations.github?.repo || 'preventsenior/soft-solutions-core',
            prStatus: 'merged',
            prNumber,
            checksPassing: true,
          },
        },
      });

      addComment(
        task.id,
        `✓ Webhook GitHub: Pull Request #${prNumber} foi mesclado na branch main com sucesso!`,
        true,
        'GitHub'
      );

      // Check auto-1
      const auto = automations.find((a) => a.trigger.type === 'GITHUB_PR_MERGED') || automations[0];
      recordRunLog(
        auto.id,
        auto.name,
        task.id,
        task.title,
        `Webhook GitHub: Evento "pull_request.closed [merged=true]" -> Demanda movida para "${doneGroup.title}" com status "Pronto".`,
        'GitHub'
      );

      showToast(
        'GitHub: PR Mesclado',
        `PR #${prNumber} mesclado com sucesso! Demanda "${task.title}" marcada como Pronto.`,
        'github'
      );
    } else if (eventType === 'PR_OPENED') {
      const prNumber = Math.floor(Math.random() * 20) + 50;
      updateTask(task.id, {
        status: 'Em Revisão',
        integrations: {
          ...task.integrations,
          github: {
            ...task.integrations.github,
            repo: 'preventsenior/soft-solutions-core',
            prStatus: 'open',
            prNumber,
            prTitle: `feat: implementation of ${task.title.toLowerCase()}`,
            checksPassing: true,
          },
        },
      });

      addComment(
        task.id,
        `🚀 GitHub Webhook: Novo Pull Request #${prNumber} aberto. Status atualizado para "Em Revisão".`,
        true,
        'GitHub'
      );

      showToast(
        'GitHub: PR Aberto',
        `Pull Request #${prNumber} aberto. Demanda movida para "Em Revisão".`,
        'github'
      );
    }
  };

  const triggerManualAutomation = (workflowId: string, targetTaskId?: string) => {
    const wf = automations.find((a) => a.id === workflowId);
    if (!wf) return;

    const task = targetTaskId ? tasks.find((t) => t.id === targetTaskId) : tasks[0];
    if (!task) return;

    if (wf.trigger.type === 'GITHUB_PR_MERGED') {
      simulateGitHubEvent('PR_MERGED', task.id);
    } else if (wf.action.type === 'CODEX_GENERATE_TESTS') {
      simulateCodexTestGeneration(task.id, wf);
    } else if (wf.action.type === 'CLAUDE_REFINE') {
      simulateClaudeRefine(task.id, wf);
    } else {
      if (wf.action.targetStatus) {
        changeTaskStatus(task.id, wf.action.targetStatus);
      }
      if (wf.action.targetGroupId) {
        changeTaskGroup(task.id, wf.action.targetGroupId);
      }
      recordRunLog(
        wf.id,
        wf.name,
        task.id,
        task.title,
        `Fluxo manual disparado: Ação "${wf.action.label}" aplicada à demanda.`,
        'Workflow'
      );
      showToast('Fluxo Executado', `Automação "${wf.name}" executada com sucesso!`, 'automation');
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        tasks,
        groups,
        automations,
        runLogs,
        currentView,
        selectedTaskId,
        searchQuery,
        filterStatus,
        filterPriority,
        filterAssigneeId,
        toasts,
        isIntegrationsOpen,
        isNewAutomationOpen,
        isAiModalOpen,
        setCurrentView,
        setSelectedTaskId,
        setSearchQuery,
        setFilterStatus,
        setFilterPriority,
        setFilterAssigneeId,
        setIsIntegrationsOpen,
        setIsNewAutomationOpen,
        setIsAiModalOpen,
        addTask,
        updateTask,
        deleteTask,
        changeTaskStatus,
        changeTaskPriority,
        changeTaskGroup,
        toggleSubtask,
        addSubtask,
        addComment,
        toggleGroupCollapse,
        addGroup,
        updateGroupTitle,
        deleteGroup,
        toggleAutomation,
        addAutomation,
        deleteAutomation,
        triggerManualAutomation,
        simulateGitHubEvent,
        simulateClaudeRefine,
        simulateCodexTestGeneration,
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
