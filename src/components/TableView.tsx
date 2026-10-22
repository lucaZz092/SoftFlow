import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MessageSquare,
  AlertCircle,
  GitBranch,
  Bot,
  Zap,
  Trash2,
  Calendar,
  X,
  CheckCircle2,
  ExternalLink,
  Layers,
  Check,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { TaskStatus, TaskPriority, CustomColumn, Task, Group } from '../types';
import { STATUS_STYLES, PRIORITY_STYLES } from '../styles/designSystem';
import { TEAM_MEMBERS } from '../data/mockData';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { EmptyState } from './ui/EmptyState';

export const TableView: React.FC = () => {
  const {
    tasks,
    groups,
    searchQuery,
    filterStatus,
    filterPriority,
    filterAssigneeId,
    toggleGroupCollapse,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    changeTaskPriority,
    setSelectedTaskId,
    addGroup,
    simulateClaudeRefine,
    simulateCodexTestGeneration,
    customColumns,
    addCustomColumn,
    removeCustomColumn,
    updateCustomFieldValue,
    hiddenColumns,
    sortBy,
    groupBy,
    selectedTaskIds,
    toggleTaskSelection,
    selectAllTasksInGroup,
    clearTaskSelection,
    bulkDeleteTasks,
    bulkSetStatus,
  } = useProject();

  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [activeStatusPopover, setActiveStatusPopover] = useState<string | null>(null);
  const [activePriorityPopover, setActivePriorityPopover] = useState<string | null>(null);
  const [activeAssigneePopover, setActiveAssigneePopover] = useState<string | null>(null);
  const [activeDatePickerTaskId, setActiveDatePickerTaskId] = useState<string | null>(null);

  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');

  // Task to delete modal
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Custom Column modal
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColType, setNewColType] = useState<CustomColumn['type']>('text');

  // Close popovers on click outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.popover-container')) {
        setActiveStatusPopover(null);
        setActivePriorityPopover(null);
        setActiveAssigneePopover(null);
        setActiveDatePickerTaskId(null);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Filter tasks
  let filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchAssignee = task.assignee?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterPriority && task.priority !== filterPriority) return false;
    if (filterAssigneeId && task.assignee?.id !== filterAssigneeId) return false;
    return true;
  });

  // Sorting
  if (sortBy) {
    filteredTasks = [...filteredTasks].sort((a, b) => {
      let valA: any = a[sortBy.field];
      let valB: any = b[sortBy.field];
      if (sortBy.field === 'priority') {
        const order: Record<string, number> = { Crítica: 4, Alta: 3, Média: 2, Baixa: 1, Nenhuma: 0 };
        valA = order[a.priority] || 0;
        valB = order[b.priority] || 0;
      }
      if (valA < valB) return sortBy.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortBy.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Handle dynamic grouping:
  let displayGroups: { id: string; title: string; color: string; collapsed: boolean; tasks: Task[] }[] = [];

  if (groupBy === 'status') {
    const statuses: TaskStatus[] = ['A Fazer', 'Trabalhando nisso', 'Em andamento', 'Em Revisão', 'Parado', 'Pronto'];
    displayGroups = statuses.map((st) => ({
      id: `group-status-${st}`,
      title: st,
      color: STATUS_STYLES[st]?.dot ? '#0066ff' : '#64748b',
      collapsed: false,
      tasks: filteredTasks.filter((t) => t.status === st),
    }));
  } else if (groupBy === 'assignee') {
    displayGroups = [
      ...TEAM_MEMBERS.map((m) => ({
        id: `group-user-${m.id}`,
        title: m.name,
        color: m.color,
        collapsed: false,
        tasks: filteredTasks.filter((t) => t.assignee?.id === m.id),
      })),
      {
        id: 'group-user-unassigned',
        title: 'Não atribuído',
        color: '#64748b',
        collapsed: false,
        tasks: filteredTasks.filter((t) => !t.assignee),
      },
    ];
  } else {
    // Default group by Group
    displayGroups = groups.map((g) => ({
      id: g.id,
      title: g.title,
      color: g.color,
      collapsed: g.collapsed,
      tasks: filteredTasks.filter((t) => t.groupId === g.id),
    }));
  }

  const handleInlineAddTask = (groupId: string) => {
    const title = newTaskTitles[groupId]?.trim();
    if (!title) return;
    addTask(groupId, title);
    setNewTaskTitles((prev) => ({ ...prev, [groupId]: '' }));
  };

  const handleCreateGroup = () => {
    if (!newGroupTitle.trim()) return;
    addGroup(newGroupTitle.trim(), '#0066ff');
    setNewGroupTitle('');
    setIsAddingGroup(false);
  };

  const handleCreateColumn = () => {
    if (!newColTitle.trim()) return;
    addCustomColumn(newColTitle.trim(), newColType);
    setNewColTitle('');
    setIsAddColumnOpen(false);
  };

  const handleSetDate = (taskId: string, newDate: string) => {
    if (!newDate) return;
    updateTask(taskId, {
      dueDate: newDate,
      timeline: {
        start: newDate,
        end: newDate,
      },
    });
    setActiveDatePickerTaskId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 select-none transition-colors">
      {/* Floating Bulk Selection Action Bar */}
      <AnimatePresence>
        {selectedTaskIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3.5 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#0066ff] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                {selectedTaskIds.length}
              </span>
              <span className="text-xs font-semibold">Demandas selecionadas</span>
            </div>

            <div className="h-4 w-px bg-[var(--border-subtle)]" />

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => bulkSetStatus('Pronto')}
                className="text-emerald-500 hover:text-emerald-600"
              >
                Marcar Pronto
              </Button>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => bulkSetStatus('Em andamento')}
              >
                Em Andamento
              </Button>
              <Button
                variant="danger"
                size="xs"
                onClick={() => setIsBulkDeleteOpen(true)}
              >
                Excluir
              </Button>
            </div>

            <button
              type="button"
              onClick={clearTaskSelection}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1.5 py-0.5 rounded cursor-pointer ml-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {displayGroups.map((group) => {
        const groupTasks = group.tasks;
        const totalCount = groupTasks.length;
        const groupTaskIds = groupTasks.map((t) => t.id);
        const allGroupSelected = groupTaskIds.length > 0 && groupTaskIds.every((id) => selectedTaskIds.includes(id));

        const statusCounts: Record<string, number> = {};
        groupTasks.forEach((t) => {
          statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
        });

        return (
          <div
            key={group.id}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs overflow-hidden transition-all"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleGroupCollapse(group.id)}
                  className="p-1 rounded-md hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  aria-label="Alternar expansão do grupo"
                >
                  {group.collapsed ? (
                    <ChevronRight className="w-4 h-4" style={{ color: group.color }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: group.color }} />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight" style={{ color: group.color }}>
                    {group.title}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums px-1.5 py-0.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    {totalCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleInlineAddTask(group.id)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Nova demanda
                </Button>
              </div>
            </div>

            {/* Group Table */}
            {!group.collapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[980px]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-canvas)]">
                      <th className="w-10 px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={allGroupSelected}
                          onChange={() => selectAllTasksInGroup(group.id)}
                          className="rounded border-[var(--border-subtle)] text-[#0066ff] cursor-pointer focus:ring-1 focus:ring-[#0066ff]"
                          aria-label="Selecionar todas as tarefas deste grupo"
                        />
                      </th>
                      <th className="px-3 py-2.5 min-w-[280px]">Demanda / Tarefa</th>
                      <th className="w-10 px-2 py-2.5 text-center" aria-label="Comentários"></th>

                      {/* Configurable standard columns */}
                      {!hiddenColumns.includes('assignee') && (
                        <th className="w-28 px-3 py-2.5 text-center">Responsável</th>
                      )}
                      {!hiddenColumns.includes('status') && (
                        <th className="w-36 px-3 py-2.5 text-center">Status</th>
                      )}
                      {!hiddenColumns.includes('dueDate') && (
                        <th className="w-28 px-3 py-2.5 text-center">Prazo</th>
                      )}
                      {!hiddenColumns.includes('priority') && (
                        <th className="w-28 px-3 py-2.5 text-center">Prioridade</th>
                      )}
                      {!hiddenColumns.includes('timeline') && (
                        <th className="w-36 px-3 py-2.5 text-center">Cronograma</th>
                      )}
                      {!hiddenColumns.includes('integrations') && (
                        <th className="w-36 px-3 py-2.5 text-center">Integrações (Git / IA)</th>
                      )}

                      {/* Dynamic Custom Columns */}
                      {customColumns.map((col) => (
                        <th key={col.id} className="w-32 px-3 py-2.5 text-center relative group/col">
                          <div className="flex items-center justify-center gap-1">
                            <span className="truncate">{col.title}</span>
                            <button
                              type="button"
                              onClick={() => removeCustomColumn(col.id)}
                              className="text-[var(--text-muted)] hover:text-rose-500 opacity-0 group-hover/col:opacity-100 transition-opacity ml-1"
                              title="Remover coluna"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </th>
                      ))}

                      {/* Add Column button */}
                      <th className="w-10 px-2 py-2.5 text-center relative">
                        <button
                          type="button"
                          onClick={() => setIsAddColumnOpen(true)}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
                          title="Criar nova coluna personalizada"
                          aria-label="Adicionar coluna"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                    {groupTasks.map((task) => {
                      const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES['Novo'];
                      const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Média'];
                      const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                      const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                      const isSelected = selectedTaskIds.includes(task.id);

                      return (
                        <tr
                          key={task.id}
                          className={`hover:bg-[var(--bg-surface-hover)] transition-colors group relative ${
                            isSelected ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTaskSelection(task.id)}
                              className="rounded border-[var(--border-subtle)] text-[#0066ff] cursor-pointer"
                              aria-label={`Selecionar ${task.title}`}
                            />
                          </td>

                          {/* Task title */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              {editingTaskId === task.id ? (
                                <input
                                  type="text"
                                  autoFocus
                                  defaultValue={task.title}
                                  onBlur={(e) => {
                                    updateTask(task.id, { title: e.target.value.trim() || task.title });
                                    setEditingTaskId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateTask(task.id, {
                                        title: (e.target as HTMLInputElement).value.trim() || task.title,
                                      });
                                      setEditingTaskId(null);
                                    }
                                  }}
                                  className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-2 py-1 rounded-md border border-[#0066ff] outline-none text-xs"
                                />
                              ) : (
                                <span
                                  onClick={() => setEditingTaskId(task.id)}
                                  className="font-medium text-[var(--text-primary)] hover:text-[#0066ff] cursor-pointer truncate max-w-[340px] transition-colors"
                                  title="Clique para editar o título"
                                >
                                  {task.title}
                                </span>
                              )}

                              {hasSubtasks && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums text-[var(--text-secondary)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] cursor-pointer"
                                  title="Sub-tarefas concluídas"
                                >
                                  {completedSubtasks}/{task.subtasks.length}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Chat / Updates Icon */}
                          <td className="px-2 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedTaskId(task.id)}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[#0066ff] transition-colors relative cursor-pointer"
                              title="Ver atualizações, logs de IA e comentários"
                              aria-label="Abrir detalhes da tarefa"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {task.comments.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0066ff] text-white text-[8px] font-bold rounded-full flex items-center justify-center font-mono">
                                  {task.comments.length}
                                </span>
                              )}
                            </button>
                          </td>

                          {/* Responsável / Assignee */}
                          {!hiddenColumns.includes('assignee') && (
                            <td className="px-3 py-2.5 text-center relative popover-container">
                              <div
                                onClick={() =>
                                  setActiveAssigneePopover(activeAssigneePopover === task.id ? null : task.id)
                                }
                                className="cursor-pointer inline-flex items-center justify-center"
                              >
                                {task.assignee ? (
                                  <div
                                    className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                                    style={{ backgroundColor: task.assignee.color }}
                                    title={task.assignee.name}
                                  >
                                    {task.assignee.initials}
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border border-dashed border-[var(--border-strong)] text-[var(--text-muted)] text-xs flex items-center justify-center hover:border-[#0066ff] transition-colors">
                                    +
                                  </div>
                                )}
                              </div>

                              {activeAssigneePopover === task.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-52 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-1.5 z-40 space-y-0.5">
                                  {TEAM_MEMBERS.map((m) => (
                                    <button
                                      type="button"
                                      key={m.id}
                                      onClick={() => {
                                        updateTask(task.id, { assignee: m });
                                        setActiveAssigneePopover(null);
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] cursor-pointer flex items-center gap-2 text-xs text-left transition-colors"
                                    >
                                      <span
                                        className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0 shadow-xs"
                                        style={{ backgroundColor: m.color }}
                                      >
                                        {m.initials}
                                      </span>
                                      <span className="truncate">{m.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                          )}

                          {/* Status Cell */}
                          {!hiddenColumns.includes('status') && (
                            <td className="px-3 py-2.5 text-center relative popover-container">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveStatusPopover(activeStatusPopover === task.id ? null : task.id)
                                }
                                className={`w-32 py-1 px-2.5 rounded-md font-medium text-xs border shadow-xs flex items-center justify-center gap-1.5 transition-all hover:opacity-90 mx-auto cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                              >
                                {statusStyle.dot && (
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                )}
                                <span className="truncate">{statusStyle.label}</span>
                              </button>

                              {activeStatusPopover === task.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-40 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-1.5 z-40 space-y-1">
                                  {(
                                    [
                                      'A Fazer',
                                      'Trabalhando nisso',
                                      'Em andamento',
                                      'Em Revisão',
                                      'Parado',
                                      'Pronto',
                                    ] as TaskStatus[]
                                  ).map((s) => {
                                    const st = STATUS_STYLES[s] || STATUS_STYLES['Novo'];
                                    return (
                                      <button
                                        type="button"
                                        key={s}
                                        onClick={() => {
                                          changeTaskStatus(task.id, s);
                                          setActiveStatusPopover(null);
                                        }}
                                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer border ${st.bg} ${st.text} ${st.border}`}
                                      >
                                        {st.dot && <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />}
                                        <span className="truncate">{s}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          )}

                          {/* Prazo with interactive popover calendar */}
                          {!hiddenColumns.includes('dueDate') && (
                            <td className="px-3 py-2.5 text-center relative popover-container">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveDatePickerTaskId(activeDatePickerTaskId === task.id ? null : task.id)
                                }
                                className="text-[var(--text-primary)] font-mono tabular-nums text-xs px-2.5 py-1 rounded-md bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] cursor-pointer transition-colors"
                              >
                                {task.dueDate ? task.dueDate.slice(5) : '-'}
                              </button>

                              {activeDatePickerTaskId === task.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-52 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-3 z-40 space-y-2.5">
                                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                    Definir Prazo
                                  </div>
                                  <input
                                    type="date"
                                    defaultValue={task.dueDate}
                                    onChange={(e) => handleSetDate(task.id, e.target.value)}
                                    className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] p-1.5 rounded-lg border border-[var(--border-subtle)] text-xs outline-none"
                                  />
                                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
                                    <button
                                      type="button"
                                      onClick={() => handleSetDate(task.id, new Date().toISOString().split('T')[0])}
                                      className="px-2 py-1 bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] rounded-md text-[11px] text-[var(--text-primary)] cursor-pointer transition-colors"
                                    >
                                      Hoje
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSetDate(
                                          task.id,
                                          new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                        )
                                      }
                                      className="px-2 py-1 bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] rounded-md text-[11px] text-[var(--text-primary)] cursor-pointer transition-colors"
                                    >
                                      Amanhã
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          )}

                          {/* Prioridade Cell */}
                          {!hiddenColumns.includes('priority') && (
                            <td className="px-3 py-2.5 text-center relative popover-container">
                              <button
                                type="button"
                                onClick={() =>
                                  setActivePriorityPopover(activePriorityPopover === task.id ? null : task.id)
                                }
                                className={`w-28 py-1 px-2 rounded-md font-medium text-xs border shadow-xs flex items-center justify-center gap-1.5 transition-all hover:opacity-90 mx-auto cursor-pointer ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                              >
                                {priorityStyle.dot && (
                                  <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                                )}
                                <span className="truncate">{priorityStyle.label}</span>
                              </button>

                              {activePriorityPopover === task.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-36 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-1.5 z-40 space-y-1">
                                  {(['Crítica', 'Alta', 'Média', 'Baixa'] as TaskPriority[]).map((p) => {
                                    const pr = PRIORITY_STYLES[p] || PRIORITY_STYLES['Média'];
                                    return (
                                      <button
                                        type="button"
                                        key={p}
                                        onClick={() => {
                                          changeTaskPriority(task.id, p);
                                          setActivePriorityPopover(null);
                                        }}
                                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer border ${pr.bg} ${pr.text} ${pr.border}`}
                                      >
                                        {pr.dot && <span className={`w-1.5 h-1.5 rounded-full ${pr.dot}`} />}
                                        <span className="truncate">{p}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          )}

                          {/* Cronograma pill */}
                          {!hiddenColumns.includes('timeline') && (
                            <td className="px-3 py-2.5 text-center">
                              <div className="w-28 mx-auto h-5 bg-[var(--bg-canvas)] rounded-full overflow-hidden flex items-center justify-center text-[10px] font-medium relative border border-[var(--border-subtle)]">
                                <div
                                  className="absolute left-0 top-0 bottom-0 bg-[#0066ff] opacity-40"
                                  style={{ width: task.status === 'Pronto' ? '100%' : '60%' }}
                                />
                                <span className="relative z-10 font-mono tabular-nums tracking-tight text-[10px] px-1 truncate text-[var(--text-primary)]">
                                  {task.timeline.start.slice(5)} - {task.timeline.end.slice(5)}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* Integrações */}
                          {!hiddenColumns.includes('integrations') && (
                            <td className="px-3 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {task.integrations.github ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] flex items-center gap-1 cursor-pointer font-mono tabular-nums ${
                                      task.integrations.github.prStatus === 'merged'
                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    }`}
                                    title={`PR #${task.integrations.github.prNumber || ''} (${task.integrations.github.prStatus || 'linked'})`}
                                  >
                                    <GitBranch className="w-3 h-3" />
                                    <span>#{task.integrations.github.prNumber || 'repo'}</span>
                                  </button>
                                ) : null}

                                {task.integrations.claude ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className="px-1.5 py-0.5 rounded-md text-[10px] bg-blue-500/10 text-[#0066ff] border border-blue-500/20 flex items-center gap-1 cursor-pointer font-medium"
                                    title="Critérios de aceite gerados pelo Claude"
                                  >
                                    <Bot className="w-3 h-3" />
                                    <span>Stories</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => simulateClaudeRefine(task.id)}
                                    className="text-[var(--text-muted)] hover:text-[#0066ff] transition-colors p-1 cursor-pointer"
                                    title="Refinar histórias com Claude"
                                  >
                                    <Bot className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {task.integrations.codex ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 cursor-pointer font-medium"
                                    title="Testes unitários gerados pelo Codex"
                                  >
                                    <Zap className="w-3 h-3" />
                                    <span>Testes</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => simulateCodexTestGeneration(task.id)}
                                    className="text-[var(--text-muted)] hover:text-amber-500 transition-colors p-1 cursor-pointer"
                                    title="Gerar testes com Codex"
                                  >
                                    <Zap className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Dynamic Custom Columns Editable Cells */}
                          {customColumns.map((col) => {
                            const val = task.customFields?.[col.id] ?? '';
                            return (
                              <td key={col.id} className="px-3 py-2.5 text-center">
                                <input
                                  type={col.type === 'number' ? 'number' : 'text'}
                                  defaultValue={val}
                                  placeholder="-"
                                  onBlur={(e) => updateCustomFieldValue(task.id, col.id, e.target.value)}
                                  className="w-full bg-transparent hover:bg-[var(--bg-canvas)] focus:bg-[var(--bg-canvas)] text-center text-[var(--text-primary)] outline-none text-xs rounded-md px-1.5 py-0.5 border border-transparent focus:border-[#0066ff] font-mono tabular-nums transition-colors"
                                />
                              </td>
                            );
                          })}

                          {/* Row Actions */}
                          <td className="px-2 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => setTaskToDelete(task.id)}
                              className="text-[var(--text-muted)] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer rounded-md hover:bg-rose-500/10"
                              title="Excluir demanda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Inline + Adicionar tarefa row */}
                    <tr className="bg-[var(--bg-canvas)]/40 hover:bg-[var(--bg-canvas)] transition-colors">
                      <td className="px-3 py-2 text-center text-[var(--text-muted)]">+</td>
                      <td colSpan={10 + customColumns.length} className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="+ Adicionar demanda ao grupo..."
                            value={newTaskTitles[group.id] || ''}
                            onChange={(e) =>
                              setNewTaskTitles((prev) => ({ ...prev, [group.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleInlineAddTask(group.id);
                              }
                            }}
                            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none text-xs"
                          />
                          {(newTaskTitles[group.id] || '').trim().length > 0 && (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => handleInlineAddTask(group.id)}
                            >
                              Salvar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>

                  {/* Group Summary Row */}
                  {totalCount > 0 && (
                    <tfoot>
                      <tr className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[11px] text-[var(--text-muted)]">
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2 font-medium">Resumo ({totalCount})</td>
                        <td className="px-2 py-2"></td>

                        {!hiddenColumns.includes('assignee') && (
                          <td className="px-3 py-2 text-center font-mono tabular-nums">{totalCount} membros</td>
                        )}

                        {!hiddenColumns.includes('status') && (
                          <td className="px-3 py-2 text-center">
                            <div className="w-28 mx-auto h-2.5 rounded-full overflow-hidden flex bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
                              {Object.entries(statusCounts).map(([st, cnt]) => {
                                const pct = Math.round((cnt / totalCount) * 100);
                                const isDone = st === 'Pronto';
                                const color = isDone ? '#10b981' : st === 'Parado' ? '#ef4444' : '#0066ff';
                                return (
                                  <div
                                    key={st}
                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                    title={`${st}: ${cnt} (${pct}%)`}
                                    className="h-full"
                                  />
                                );
                              })}
                            </div>
                          </td>
                        )}

                        {!hiddenColumns.includes('dueDate') && (
                          <td className="px-3 py-2 text-center font-mono tabular-nums">{totalCount} prazos</td>
                        )}

                        {!hiddenColumns.includes('priority') && (
                          <td className="px-3 py-2 text-center font-mono text-[10px]">prioridades</td>
                        )}

                        {!hiddenColumns.includes('timeline') && (
                          <td className="px-3 py-2 text-center font-mono text-[10px]">ativo</td>
                        )}

                        {!hiddenColumns.includes('integrations') && (
                          <td className="px-3 py-2 text-center text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                            conectado
                          </td>
                        )}

                        {customColumns.map((c) => (
                          <td key={c.id} className="px-3 py-2 text-center text-[var(--text-muted)] font-mono text-[10px]">
                            -
                          </td>
                        ))}

                        <td className="px-2 py-2"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        );
      })}

      {displayGroups.length === 0 && (
        <EmptyState
          icon={Layers}
          title="Nenhuma demanda encontrada"
          description="Nenhuma tarefa corresponde aos filtros ou busca selecionados no momento."
          actionLabel="Limpar Filtros"
          onAction={() => {}}
        />
      )}

      {/* + Adicionar novo grupo */}
      <div className="pt-1">
        {isAddingGroup ? (
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2.5 rounded-xl max-w-md shadow-xs">
            <input
              type="text"
              autoFocus
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateGroup();
                if (e.key === 'Escape') setIsAddingGroup(false);
              }}
              placeholder="Nome do grupo (ex: Engenharia Backend)..."
              className="bg-[var(--bg-canvas)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] outline-none text-xs flex-1 focus:border-[#0066ff]"
            />
            <Button variant="primary" size="sm" onClick={handleCreateGroup}>
              Criar grupo
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAddingGroup(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddingGroup(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-[#0066ff]" />}
          >
            Adicionar novo grupo de demandas
          </Button>
        )}
      </div>

      {/* Add Custom Column Modal */}
      {isAddColumnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[var(--text-primary)] text-sm">Adicionar Nova Coluna</h3>
              <button
                type="button"
                onClick={() => setIsAddColumnOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">Título da Coluna:</label>
                <input
                  type="text"
                  autoFocus
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="ex: Estimativa (Horas), PR Link, Tags..."
                  className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] outline-none text-xs focus:border-[#0066ff]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">Tipo de Dado:</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as CustomColumn['type'])}
                  className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] outline-none text-xs cursor-pointer focus:border-[#0066ff]"
                >
                  <option value="text">Texto Livre</option>
                  <option value="number">Número / Horas</option>
                  <option value="date">Data</option>
                  <option value="link">Link Externo</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <Button variant="ghost" size="sm" onClick={() => setIsAddColumnOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateColumn}>
                Criar Coluna
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
        title="Excluir Demanda"
        description="Tem certeza de que deseja excluir esta demanda? Esta ação não pode ser desfeita e removerá os dados vinculados."
        confirmText="Excluir"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={() => {
          bulkDeleteTasks();
          setIsBulkDeleteOpen(false);
        }}
        title={`Excluir ${selectedTaskIds.length} Demandas`}
        description={`Tem certeza de que deseja excluir todas as ${selectedTaskIds.length} demandas selecionadas?`}
        confirmText="Excluir Selecionadas"
      />
    </div>
  );
};
