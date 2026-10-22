import React, { useState } from 'react';
import {
  Plus,
  GitBranch,
  Bot,
  Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { TaskStatus } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';

export const KanbanView: React.FC = () => {
  const {
    tasks,
    groups,
    searchQuery,
    filterStatus,
    filterPriority,
    filterAssigneeId,
    moveTaskToStatus,
    setSelectedTaskId,
    addTask,
  } = useProject();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: TaskStatus[] = ['A Fazer', 'Em andamento', 'Em Revisão', 'Parado', 'Pronto'];

  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterPriority && task.priority !== filterPriority) return false;
    if (filterAssigneeId && task.assignee?.id !== filterAssigneeId) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDrop = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskToStatus(taskId, colStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-5 bg-[#12141a] select-none">
      <div className="flex items-start space-x-3.5 h-full min-w-max pb-4">
        {columns.map((colStatus) => {
          const colTasks = filteredTasks.filter((t) => t.status === colStatus);
          const colConfig = STATUS_CONFIG[colStatus];
          const isOver = dragOverColumn === colStatus;

          return (
            <div
              key={colStatus}
              onDragOver={(e) => handleDragOver(e, colStatus)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, colStatus)}
              className={`w-76 flex flex-col max-h-full rounded-lg bg-[#161922] border transition-all shadow-xs ${
                isOver ? 'border-[#0073ea] ring-2 ring-[#0073ea]/30 bg-[#191d29]' : 'border-[#212633]'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-[#212633] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colConfig.bg }}
                  />
                  <span className="font-semibold text-xs text-white uppercase tracking-wider">{colStatus}</span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-400">
                    ({colTasks.length})
                  </span>
                </div>

                <button
                  onClick={() => addTask(groups[0]?.id || 'group-marketing')}
                  className="p-1 rounded hover:bg-[#202533] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Nova tarefa nesta coluna"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {colTasks.map((task) => {
                  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Média'];
                  const taskGroup = groups.find((g) => g.id === task.groupId);
                  const isBeingDragged = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`p-3 rounded-md bg-[#191d27] hover:bg-[#1e2330] border border-[#252b39] hover:border-[#31394b] transition-all cursor-grab active:cursor-grabbing shadow-xs space-y-2 group ${
                        isBeingDragged ? 'opacity-40 scale-95 border-dashed border-blue-400' : 'opacity-100'
                      }`}
                    >
                      {/* Group and Priority */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-medium text-slate-300 truncate max-w-[140px]">
                          {taskGroup?.title || 'Geral'}
                        </span>

                        <span
                          style={{ backgroundColor: priorityInfo.bg, color: priorityInfo.text }}
                          className="px-1.5 py-0.2 rounded text-[10px] font-medium"
                        >
                          {priorityInfo.label}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="font-medium text-xs text-slate-200 group-hover:text-white leading-snug">
                        {task.title}
                      </div>

                      {/* Integrations */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {task.integrations.github?.prNumber && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums bg-purple-900/30 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                            <GitBranch className="w-3 h-3" />
                            <span>PR #{task.integrations.github.prNumber}</span>
                          </span>
                        )}

                        {task.integrations.codex && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-900/30 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>Codex Testes</span>
                          </span>
                        )}

                        {task.integrations.claude && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                            <Bot className="w-3 h-3" />
                            <span>Claude</span>
                          </span>
                        )}
                      </div>

                      {/* Footer: Assignee, DueDate, and quick status move */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#222735] text-[11px] text-slate-400">
                        <div className="flex items-center space-x-2">
                          {task.assignee ? (
                            <span
                              className="w-4.5 h-4.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                              style={{ backgroundColor: task.assignee.color }}
                              title={task.assignee.name}
                            >
                              {task.assignee.initials}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Sem atribuição</span>
                          )}

                          <span className="font-mono tabular-nums text-slate-400 text-[10px]">{task.dueDate.slice(5)}</span>
                        </div>

                        {/* Quick move column buttons */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {columns.map((st) => {
                            if (st === task.status) return null;
                            return (
                              <button
                                key={st}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTaskToStatus(task.id, st);
                                }}
                                style={{ backgroundColor: STATUS_CONFIG[st].bg }}
                                className="w-2.5 h-2.5 rounded-full hover:scale-125 transition-transform cursor-pointer"
                                title={`Mover para ${st}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className={`p-5 text-center text-xs text-slate-500 border border-dashed rounded-md transition-colors ${
                    isOver ? 'border-[#0073ea] bg-[#0073ea]/5 text-[#579bfc]' : 'border-[#252b39]'
                  }`}>
                    {isOver ? 'Soltar tarefa aqui' : 'Nenhuma tarefa'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
