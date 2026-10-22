import React, { useState } from 'react';
import {
  Plus,
  GitBranch,
  Bot,
  Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { TaskStatus } from '../types';
import { STATUS_STYLES, PRIORITY_STYLES } from '../styles/designSystem';

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

  const columns: TaskStatus[] = ['A Fazer', 'Trabalhando nisso', 'Em andamento', 'Em Revisão', 'Parado', 'Pronto'];

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
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6 bg-[var(--bg-canvas)] select-none transition-colors">
      <div className="flex items-start gap-4 h-full min-w-max pb-4">
        {columns.map((colStatus) => {
          const colTasks = filteredTasks.filter((t) => t.status === colStatus);
          const colStyle = STATUS_STYLES[colStatus] || STATUS_STYLES['Novo'];
          const isOver = dragOverColumn === colStatus;

          return (
            <div
              key={colStatus}
              onDragOver={(e) => handleDragOver(e, colStatus)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, colStatus)}
              className={`w-72 sm:w-80 flex flex-col max-h-full rounded-xl bg-[var(--bg-surface)] border transition-all shadow-xs ${
                isOver
                  ? 'border-[#0066ff] ring-2 ring-[#0066ff]/20 bg-[var(--bg-surface-hover)]'
                  : 'border-[var(--border-subtle)]'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colStyle.dot}`} />
                  <span className="font-semibold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                    {colStatus}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const task = addTask(groups[0]?.id || 'group-marketing', 'Nova Demanda');
                    moveTaskToStatus(task.id, colStatus);
                  }}
                  className="p-1 rounded-md hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="Nova demanda nesta coluna"
                  aria-label="Nova demanda"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {colTasks.map((task) => {
                  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Média'];
                  const taskGroup = groups.find((g) => g.id === task.groupId);
                  const isBeingDragged = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`p-3.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all cursor-grab active:cursor-grabbing shadow-xs space-y-2.5 group ${
                        isBeingDragged ? 'opacity-40 scale-95 border-dashed border-[#0066ff]' : 'opacity-100'
                      }`}
                    >
                      {/* Group and Priority */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--text-muted)] truncate max-w-[140px] text-[11px]">
                          {taskGroup?.title || 'Geral'}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="font-semibold text-xs text-[var(--text-primary)] leading-snug group-hover:text-[#0066ff] transition-colors">
                        {task.title}
                      </div>

                      {/* Integrations */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {task.integrations.github?.prNumber && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            <span>PR #{task.integrations.github.prNumber}</span>
                          </span>
                        )}

                        {task.integrations.codex && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>Vitest</span>
                          </span>
                        )}

                        {task.integrations.claude && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-[#0066ff] border border-blue-500/20 flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            <span>Claude</span>
                          </span>
                        )}
                      </div>

                      {/* Footer: Assignee, DueDate, and quick status move */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                          {task.assignee ? (
                            <div
                              className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0 shadow-xs"
                              style={{ backgroundColor: task.assignee.color }}
                              title={task.assignee.name}
                            >
                              {task.assignee.initials}
                            </div>
                          ) : (
                            <span className="text-[var(--text-muted)] text-[10px]">Sem atribuição</span>
                          )}

                          <span className="font-mono tabular-nums text-xs text-[var(--text-secondary)]">
                            {task.dueDate.slice(5)}
                          </span>
                        </div>

                        {/* Quick move column buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {columns.map((st) => {
                            if (st === task.status) return null;
                            const targetColStyle = STATUS_STYLES[st] || STATUS_STYLES['Novo'];
                            return (
                              <button
                                type="button"
                                key={st}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTaskToStatus(task.id, st);
                                }}
                                className={`w-3 h-3 rounded-full hover:scale-125 transition-transform cursor-pointer border border-black/10 ${targetColStyle.dot}`}
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
                  <div
                    className={`p-6 text-center text-xs text-[var(--text-muted)] border border-dashed rounded-xl transition-colors ${
                      isOver
                        ? 'border-[#0066ff] bg-[#0066ff]/5 text-[#0066ff]'
                        : 'border-[var(--border-subtle)]'
                    }`}
                  >
                    {isOver ? 'Soltar demanda aqui' : 'Nenhuma demanda nesta etapa'}
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
