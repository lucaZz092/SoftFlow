import React, { useState } from 'react';
import {
  Plus,
  GitBranch,
  Bot,
  Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { TaskBadges } from './task/TaskBadges';
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
    filterTagId,
    moveTaskToStatus,
    setSelectedTaskId,
    addTask,
    automations,
    setCurrentView,
  } = useProject();

  // Enabled rules that fire when a card lands in each column
  const columnAutomations = (status: TaskStatus) =>
    automations.filter(
      (a) => a.enabled && a.trigger.type === 'STATUS_CHANGE' && (!a.trigger.targetStatus || a.trigger.targetStatus === status)
    );

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
    if (filterTagId && !task.tags?.includes(filterTagId)) return false;
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
                  ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 bg-[var(--bg-surface-hover)]'
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
                  {columnAutomations(colStatus).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentView('automations')}
                      className="inline-flex items-center gap-0.5 text-[11px] tabular-nums text-[var(--accent-primary)] hover:underline cursor-pointer"
                      title={`Ao soltar aqui: ${columnAutomations(colStatus)
                        .map((a) => a.name)
                        .join(', ')}`}
                      aria-label={`${columnAutomations(colStatus).length} automações nesta coluna`}
                    >
                      <Zap className="w-3 h-3" />
                      {columnAutomations(colStatus).length}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addTask(groups[0]?.id || 'group-marketing', 'Nova Demanda', { status: colStatus });
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
                      style={task.color ? { boxShadow: `inset 3px 0 0 ${task.color}` } : undefined}
                      className={`p-3.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all cursor-grab active:cursor-grabbing shadow-xs space-y-2.5 group ${
                        isBeingDragged ? 'opacity-40 scale-95 border-dashed border-[var(--accent-primary)]' : 'opacity-100'
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
                      <div className="font-semibold text-xs text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-primary)] transition-colors">
                        {task.title}
                      </div>
                      <TaskBadges task={task} />

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
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 text-[var(--accent-primary)]'
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
