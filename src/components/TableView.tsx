import React, { useState } from 'react';
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
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { TaskStatus, TaskPriority, CustomColumn, Task, Group } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, TEAM_MEMBERS } from '../data/mockData';

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
  
  // Custom Column modal
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColType, setNewColType] = useState<CustomColumn['type']>('text');

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
        const order: Record<string, number> = { 'Crítica': 4, 'Alta': 3, 'Média': 2, 'Baixa': 1, 'Nenhuma': 0 };
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
    const statuses: TaskStatus[] = ['A Fazer', 'Em andamento', 'Em Revisão', 'Parado', 'Pronto'];
    displayGroups = statuses.map((st) => ({
      id: `group-status-${st}`,
      title: st,
      color: STATUS_CONFIG[st]?.bg || '#579bfc',
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
        id: 'group-unassigned',
        title: 'Sem Responsável',
        color: '#64748b',
        collapsed: false,
        tasks: filteredTasks.filter((t) => !t.assignee),
      },
    ];
  } else {
    // Default by business group
    displayGroups = groups.map((g) => ({
      ...g,
      tasks: filteredTasks.filter((t) => t.groupId === g.id),
    }));
  }

  const handleInlineAddTask = (groupId: string) => {
    const title = newTaskTitles[groupId]?.trim();
    const targetGroupId = groups.some((g) => g.id === groupId) ? groupId : groups[0]?.id || 'group-marketing';
    if (title) {
      addTask(targetGroupId, title);
      setNewTaskTitles((prev) => ({ ...prev, [groupId]: '' }));
    } else {
      addTask(targetGroupId, 'Nova Demanda');
    }
  };

  const handleCreateGroup = () => {
    if (newGroupTitle.trim()) {
      addGroup(newGroupTitle.trim());
      setNewGroupTitle('');
      setIsAddingGroup(false);
    }
  };

  const handleCreateColumn = () => {
    if (newColTitle.trim()) {
      addCustomColumn(newColTitle.trim(), newColType);
      setNewColTitle('');
      setIsAddColumnOpen(false);
    }
  };

  const handleSetDate = (taskId: string, dateStr: string) => {
    updateTask(taskId, {
      dueDate: dateStr,
      timeline: {
        start: new Date().toISOString().split('T')[0],
        end: dateStr,
      },
    });
    setActiveDatePickerTaskId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 select-none bg-[#12141a]">
      {/* Floating Bulk Action Bar when items are selected */}
      {selectedTaskIds.length > 0 && (
        <div className="sticky top-0 z-40 p-2.5 rounded-lg bg-[#191d27] border border-[#2b3345] shadow-xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-white px-2 py-0.5 rounded bg-[#0073ea]">
              {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'selecionada' : 'selecionadas'}
            </span>
            <span className="text-slate-400">Ações em lote:</span>
            <button
              onClick={() => bulkSetStatus('Pronto')}
              className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-medium transition-colors cursor-pointer"
            >
              Marcar como Pronto
            </button>
            <button
              onClick={() => bulkSetStatus('Em andamento')}
              className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 font-medium transition-colors cursor-pointer"
            >
              Marcar Em andamento
            </button>
            <button
              onClick={bulkDeleteTasks}
              className="px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-medium transition-colors cursor-pointer"
            >
              Excluir selecionadas
            </button>
          </div>

          <button
            onClick={clearTaskSelection}
            className="text-slate-400 hover:text-white px-2 py-1 rounded cursor-pointer"
          >
            Limpar seleção
          </button>
        </div>
      )}

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
          <div key={group.id} className="rounded-lg border border-[#212633] bg-[#161922] shadow-xs overflow-hidden">
            {/* Group Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#171b25] border-b border-[#212633]">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleGroupCollapse(group.id)}
                  className="p-1 rounded hover:bg-[#202533] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {group.collapsed ? (
                    <ChevronRight className="w-4 h-4" style={{ color: group.color }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: group.color }} />
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm tracking-tight" style={{ color: group.color }}>
                    {group.title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    ({totalCount} {totalCount === 1 ? 'tarefa' : 'tarefas'})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleInlineAddTask(group.id)}
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-[#202533] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova tarefa</span>
                </button>
              </div>
            </div>

            {/* Group Table */}
            {!group.collapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-[#212633] text-[11px] font-semibold text-slate-400 bg-[#151821]">
                      <th className="w-9 px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={allGroupSelected}
                          onChange={() => selectAllTasksInGroup(group.id)}
                          className="rounded bg-[#1e222e] border-[#2d3443] text-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-2 min-w-[280px]">Demanda / Tarefa</th>
                      <th className="w-10 px-2 py-2 text-center"></th>

                      {/* Configurable standard columns */}
                      {!hiddenColumns.includes('assignee') && (
                        <th className="w-28 px-3 py-2 text-center">Responsável</th>
                      )}
                      {!hiddenColumns.includes('status') && (
                        <th className="w-36 px-3 py-2 text-center">Status</th>
                      )}
                      {!hiddenColumns.includes('dueDate') && (
                        <th className="w-28 px-3 py-2 text-center">Prazo</th>
                      )}
                      {!hiddenColumns.includes('priority') && (
                        <th className="w-28 px-3 py-2 text-center">Prioridade</th>
                      )}
                      {!hiddenColumns.includes('timeline') && (
                        <th className="w-36 px-3 py-2 text-center">Cronograma</th>
                      )}
                      {!hiddenColumns.includes('integrations') && (
                        <th className="w-36 px-3 py-2 text-center">Integrações (Git / IA)</th>
                      )}

                      {/* Dynamic Custom Columns */}
                      {customColumns.map((col) => (
                        <th key={col.id} className="w-32 px-3 py-2 text-center relative group/col">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="truncate">{col.title}</span>
                            <button
                              onClick={() => removeCustomColumn(col.id)}
                              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover/col:opacity-100 transition-opacity ml-1"
                              title="Remover coluna"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </th>
                      ))}

                      {/* Add Column button */}
                      <th className="w-10 px-2 py-2 text-center relative">
                        <button
                          onClick={() => setIsAddColumnOpen(true)}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#202533] cursor-pointer"
                          title="Criar nova coluna personalizada"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202532] text-xs">
                    {groupTasks.map((task) => {
                      const statusInfo = STATUS_CONFIG[task.status] || STATUS_CONFIG['A Fazer'];
                      const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Média'];
                      const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                      const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                      const isSelected = selectedTaskIds.includes(task.id);

                      return (
                        <tr
                          key={task.id}
                          className={`hover:bg-[#1a1e28] transition-colors group relative ${
                            isSelected ? 'bg-[#0073ea]/10' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTaskSelection(task.id)}
                              className="rounded bg-[#1e222e] border-[#2d3443] text-blue-500 cursor-pointer"
                            />
                          </td>

                          {/* Task title */}
                          <td className="px-3 py-2">
                            <div className="flex items-center space-x-2">
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
                                      updateTask(task.id, { title: (e.target as HTMLInputElement).value.trim() || task.title });
                                      setEditingTaskId(null);
                                    }
                                  }}
                                  className="w-full bg-[#1e222e] text-white px-2 py-1 rounded border border-[#0073ea] outline-none text-xs"
                                />
                              ) : (
                                <span
                                  onClick={() => setEditingTaskId(task.id)}
                                  className="font-medium text-slate-200 hover:text-white cursor-pointer truncate max-w-[340px]"
                                  title="Clique para editar o título"
                                >
                                  {task.title}
                                </span>
                              )}

                              {hasSubtasks && (
                                <button
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums text-slate-300 bg-[#1e2330] hover:bg-[#252c3c] border border-[#293040] cursor-pointer"
                                  title="Sub-tarefas concluídas"
                                >
                                  {completedSubtasks}/{task.subtasks.length}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Chat / Updates Icon */}
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => setSelectedTaskId(task.id)}
                              className="p-1.5 rounded hover:bg-[#202533] text-slate-400 hover:text-blue-400 transition-colors relative cursor-pointer"
                              title="Ver atualizações, logs de IA e comentários"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {task.comments.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#0073ea] text-white text-[8px] font-bold rounded-full flex items-center justify-center font-mono">
                                  {task.comments.length}
                                </span>
                              )}
                            </button>
                          </td>

                          {/* Responsável / Assignee */}
                          {!hiddenColumns.includes('assignee') && (
                            <td className="px-3 py-2 text-center relative">
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
                                  <div className="w-6 h-6 rounded-full border border-dashed border-slate-500 text-slate-400 text-xs flex items-center justify-center hover:border-slate-300">
                                    +
                                  </div>
                                )}
                              </div>

                              {activeAssigneePopover === task.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-48 bg-[#1b1f2b] border border-[#2b3243] rounded-md shadow-xl p-1 z-30">
                                  {TEAM_MEMBERS.map((m) => (
                                    <button
                                      key={m.id}
                                      onClick={() => {
                                        updateTask(task.id, { assignee: m });
                                        setActiveAssigneePopover(null);
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded hover:bg-[#242b3a] text-slate-300 cursor-pointer flex items-center space-x-2 text-xs text-left"
                                    >
                                      <span
                                        className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0"
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
                            <td className="px-3 py-2 text-center relative">
                              <button
                                onClick={() =>
                                  setActiveStatusPopover(activeStatusPopover === task.id ? null : task.id)
                                }
                                style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                                className="w-28 py-1 px-2 rounded-[4px] font-medium text-xs shadow-xs flex items-center justify-center space-x-1 transition-opacity hover:opacity-90 mx-auto cursor-pointer"
                              >
                                {task.status === 'Parado' && <AlertCircle className="w-3 h-3 shrink-0" />}
                                <span className="truncate">{statusInfo.label}</span>
                              </button>

                              {activeStatusPopover === task.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-36 bg-[#171a23] border border-[#2b3243] rounded-md shadow-2xl p-1 z-40 space-y-1">
                                  {Object.keys(STATUS_CONFIG).map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => {
                                        changeTaskStatus(task.id, s as TaskStatus);
                                        setActiveStatusPopover(null);
                                      }}
                                      style={{ backgroundColor: STATUS_CONFIG[s].bg }}
                                      className="w-full text-white py-1 px-2 rounded-[3px] text-xs font-semibold hover:brightness-110 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                          )}

                          {/* Prazo with interactive popover calendar */}
                          {!hiddenColumns.includes('dueDate') && (
                            <td className="px-3 py-2 text-center relative">
                              <button
                                onClick={() =>
                                  setActiveDatePickerTaskId(activeDatePickerTaskId === task.id ? null : task.id)
                                }
                                className="text-slate-300 font-mono tabular-nums text-[11px] px-2 py-0.5 rounded bg-[#1b1f2b] hover:bg-[#222838] border border-[#262c3b] cursor-pointer transition-colors"
                              >
                                {task.dueDate ? task.dueDate.slice(5) : '-'}
                              </button>

                              {activeDatePickerTaskId === task.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-48 bg-[#1b1f2b] border border-[#2b3243] rounded-md shadow-2xl p-2 z-40 space-y-2">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Definir Prazo
                                  </div>
                                  <input
                                    type="date"
                                    defaultValue={task.dueDate}
                                    onChange={(e) => handleSetDate(task.id, e.target.value)}
                                    className="w-full bg-[#202533] text-white p-1 rounded border border-[#2d3443] text-xs outline-none"
                                  />
                                  <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[#262c3b]">
                                    <button
                                      onClick={() => handleSetDate(task.id, new Date().toISOString().split('T')[0])}
                                      className="px-2 py-1 bg-[#202533] hover:bg-[#282f40] rounded text-[10px] text-slate-300 cursor-pointer"
                                    >
                                      Hoje
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSetDate(
                                          task.id,
                                          new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                        )
                                      }
                                      className="px-2 py-1 bg-[#202533] hover:bg-[#282f40] rounded text-[10px] text-slate-300 cursor-pointer"
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
                            <td className="px-3 py-2 text-center relative">
                              <button
                                onClick={() =>
                                  setActivePriorityPopover(activePriorityPopover === task.id ? null : task.id)
                                }
                                style={{ backgroundColor: priorityInfo.bg, color: priorityInfo.text }}
                                className="w-24 py-1 px-2 rounded-[4px] font-medium text-xs shadow-xs flex items-center justify-center transition-opacity hover:opacity-90 mx-auto cursor-pointer"
                              >
                                <span className="truncate">{priorityInfo.label}</span>
                              </button>

                              {activePriorityPopover === task.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-32 bg-[#171a23] border border-[#2b3243] rounded-md shadow-2xl p-1 z-40 space-y-1">
                                  {['Crítica', 'Alta', 'Média', 'Baixa'].map((p) => (
                                    <button
                                      key={p}
                                      onClick={() => {
                                        changeTaskPriority(task.id, p as TaskPriority);
                                        setActivePriorityPopover(null);
                                      }}
                                      style={{ backgroundColor: PRIORITY_CONFIG[p].bg, color: PRIORITY_CONFIG[p].text }}
                                      className="w-full py-1 px-2 rounded-[3px] text-xs font-semibold hover:brightness-110 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                                    >
                                      {p}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                          )}

                          {/* Cronograma pill */}
                          {!hiddenColumns.includes('timeline') && (
                            <td className="px-3 py-2 text-center">
                              <div className="w-28 mx-auto h-5 bg-[#1b1f2b] rounded-full overflow-hidden flex items-center justify-center text-[10px] text-white font-medium relative border border-[#262c3b]">
                                <div
                                  className="absolute left-0 top-0 bottom-0 bg-[#0073ea] opacity-70"
                                  style={{ width: task.status === 'Pronto' ? '100%' : '60%' }}
                                />
                                <span className="relative z-10 font-mono tabular-nums tracking-tight text-[9px] px-1 truncate">
                                  {task.timeline.start.slice(5)} - {task.timeline.end.slice(5)}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* Integrações */}
                          {!hiddenColumns.includes('integrations') && (
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                {task.integrations.github ? (
                                  <button
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] flex items-center space-x-1 cursor-pointer font-mono tabular-nums ${
                                      task.integrations.github.prStatus === 'merged'
                                        ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                                        : 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30'
                                    }`}
                                    title={`PR #${task.integrations.github.prNumber || ''} (${task.integrations.github.prStatus || 'linked'})`}
                                  >
                                    <GitBranch className="w-3 h-3" />
                                    <span>#{task.integrations.github.prNumber || 'repo'}</span>
                                  </button>
                                ) : null}

                                {task.integrations.claude ? (
                                  <button
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1 cursor-pointer"
                                    title="Critérios de aceite refinados pelo Claude"
                                  >
                                    <Bot className="w-3 h-3 text-indigo-400" />
                                    <span>Stories</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => simulateClaudeRefine(task.id)}
                                    className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors p-1 cursor-pointer"
                                    title="Refinar com Claude"
                                  >
                                    <Bot className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {task.integrations.codex ? (
                                  <button
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-amber-900/30 text-amber-300 border border-amber-500/30 flex items-center space-x-1 cursor-pointer"
                                    title="Testes unitários gerados pelo Codex"
                                  >
                                    <Zap className="w-3 h-3 text-amber-400" />
                                    <span>Testes</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => simulateCodexTestGeneration(task.id)}
                                    className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors p-1 cursor-pointer"
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
                              <td key={col.id} className="px-3 py-2 text-center">
                                <input
                                  type={col.type === 'number' ? 'number' : 'text'}
                                  defaultValue={val}
                                  placeholder="-"
                                  onBlur={(e) => updateCustomFieldValue(task.id, col.id, e.target.value)}
                                  className="w-full bg-transparent hover:bg-[#202533] focus:bg-[#202533] text-center text-slate-200 outline-none text-xs rounded px-1 py-0.5 border border-transparent focus:border-[#0073ea] font-mono tabular-nums transition-colors"
                                />
                              </td>
                            );
                          })}

                          {/* Row Actions */}
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                              title="Excluir tarefa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Inline + Adicionar tarefa row */}
                    <tr className="bg-[#141720]/70 hover:bg-[#181c26] transition-colors">
                      <td className="px-3 py-2 text-center text-slate-500">+</td>
                      <td colSpan={10 + customColumns.length} className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="+ Adicionar tarefa..."
                            value={newTaskTitles[group.id] || ''}
                            onChange={(e) =>
                              setNewTaskTitles((prev) => ({ ...prev, [group.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleInlineAddTask(group.id);
                              }
                            }}
                            className="w-full bg-transparent text-slate-300 placeholder-slate-500 outline-none text-xs"
                          />
                          {(newTaskTitles[group.id] || '').trim().length > 0 && (
                            <button
                              onClick={() => handleInlineAddTask(group.id)}
                              className="px-2.5 py-1 bg-[#0073ea] text-white rounded text-[11px] font-semibold shrink-0 cursor-pointer"
                            >
                              Salvar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>

                  {/* Group Summary Row */}
                  {totalCount > 0 && (
                    <tfoot>
                      <tr className="border-t border-[#212633] bg-[#141720] text-[10px] text-slate-400">
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2 font-medium">Resumo do grupo</td>
                        <td className="px-2 py-2"></td>

                        {!hiddenColumns.includes('assignee') && (
                          <td className="px-3 py-2 text-center font-mono tabular-nums">{totalCount} atribuições</td>
                        )}

                        {!hiddenColumns.includes('status') && (
                          <td className="px-3 py-2 text-center">
                            <div className="w-28 mx-auto h-3 rounded-[3px] overflow-hidden flex bg-[#1e2330] border border-[#272e3d]">
                              {Object.entries(statusCounts).map(([st, cnt]) => {
                                const pct = Math.round((cnt / totalCount) * 100);
                                const color = STATUS_CONFIG[st]?.bg || '#579bfc';
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
                          <td className="px-3 py-2 text-center font-mono tabular-nums">
                            {totalCount} prazos
                          </td>
                        )}

                        {!hiddenColumns.includes('priority') && (
                          <td className="px-3 py-2 text-center">
                            <div className="w-20 mx-auto h-2 bg-[#202533] rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 w-3/4" />
                            </div>
                          </td>
                        )}

                        {!hiddenColumns.includes('timeline') && (
                          <td className="px-3 py-2 text-center font-mono text-[9px]">
                            Cronograma ativo
                          </td>
                        )}

                        {!hiddenColumns.includes('integrations') && (
                          <td className="px-3 py-2 text-center text-emerald-400 font-mono text-[10px]">
                            Fluxos integrados
                          </td>
                        )}

                        {customColumns.map((c) => (
                          <td key={c.id} className="px-3 py-2 text-center text-slate-500 font-mono text-[10px]">
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

      {/* + Adicionar novo grupo */}
      <div className="pt-1">
        {isAddingGroup ? (
          <div className="flex items-center space-x-2 bg-[#171a24] border border-[#272e3d] p-2.5 rounded-md max-w-md">
            <input
              type="text"
              autoFocus
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateGroup();
                if (e.key === 'Escape') setIsAddingGroup(false);
              }}
              placeholder="Nome do novo grupo (ex: Engenharia Backend)..."
              className="bg-[#1f2430] text-slate-200 px-3 py-1.5 rounded border border-[#2b3243] outline-none text-xs flex-1"
            />
            <button
              onClick={handleCreateGroup}
              className="px-3 py-1.5 bg-[#0073ea] text-white rounded text-xs font-semibold hover:bg-blue-600 cursor-pointer"
            >
              Criar grupo
            </button>
            <button
              onClick={() => setIsAddingGroup(false)}
              className="px-2 py-1.5 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingGroup(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#171a24] hover:bg-[#1e2330] border border-[#272e3d] text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Adicionar novo grupo</span>
          </button>
        )}
      </div>

      {/* Add Custom Column Modal */}
      {isAddColumnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <div className="w-full max-w-sm bg-[#161922] border border-[#272e3d] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Adicionar Nova Coluna</h3>
              <button
                onClick={() => setIsAddColumnOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Título da Coluna:</label>
                <input
                  type="text"
                  autoFocus
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="ex: Estimativa (Horas), PR Link, Tags..."
                  className="w-full bg-[#1e2330] text-slate-200 px-3 py-1.5 rounded border border-[#2a3140] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tipo de Dado:</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as CustomColumn['type'])}
                  className="w-full bg-[#1e2330] text-slate-200 px-3 py-1.5 rounded border border-[#2a3140] outline-none text-xs cursor-pointer"
                >
                  <option value="text">Texto Livre</option>
                  <option value="number">Número / Horas</option>
                  <option value="date">Data</option>
                  <option value="link">Link Externo</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 text-xs">
              <button
                onClick={() => setIsAddColumnOpen(false)}
                className="px-3 py-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateColumn}
                className="px-4 py-1.5 rounded bg-[#0073ea] hover:bg-blue-600 text-white font-semibold cursor-pointer"
              >
                Criar Coluna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
