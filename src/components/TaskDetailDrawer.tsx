import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, CheckSquare, Send, Plus, Info, Clock, Paperclip, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { STATUS_STYLES, PRIORITY_STYLES } from '../styles/designSystem';
import { TaskStatus, TaskPriority } from '../types';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Checkbox';
import { TaskDetailsTab } from './task/TaskDetailsTab';
import { TaskTimeTab } from './task/TaskTimeTab';
import { TaskAttachmentsTab } from './task/TaskAttachmentsTab';

type DrawerTab = 'details' | 'comments' | 'subtasks' | 'time' | 'attachments';

export const TaskDetailDrawer: React.FC = () => {
  const {
    members,
    allTasks,
    allGroups: groups,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    changeTaskStatus,
    changeTaskPriority,
    toggleSubtask,
    addSubtask,
    addComment,
    archiveTask,
    unarchiveTask,
    deleteTask,
  } = useProject();

  const [activeTab, setActiveTab] = useState<DrawerTab>('details');
  const [commentInput, setCommentInput] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTaskId) {
        setSelectedTaskId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId, setSelectedTaskId]);

  if (!selectedTaskId) return null;

  const task = allTasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const taskGroup = groups.find((g) => g.id === task.groupId);
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtasksTotal = task.subtasks?.length || 0;
  const subtasksPercent = subtasksTotal > 0 ? Math.round((completedSubtasks / subtasksTotal) * 100) : 0;

  const handleSendComment = () => {
    if (commentInput.trim()) {
      addComment(task.id, commentInput.trim());
      setCommentInput('');
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskInput.trim()) {
      addSubtask(task.id, newSubtaskInput.trim());
      setNewSubtaskInput('');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedTaskId(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-xl sm:max-w-2xl h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[var(--text-secondary)]">{taskGroup?.title}</span>
                <span className="text-[var(--text-muted)] font-mono" aria-hidden="true">
                  /
                </span>
                <span className="text-[var(--text-muted)] font-mono text-[11px] tabular-nums">{task.id}</span>
              </div>

              <input
                type="text"
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                className="w-full text-base sm:text-lg font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent-primary)] outline-none pb-0.5 transition-colors"
                title="Editar título da demanda"
              />
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => (task.archivedAt ? unarchiveTask(task.id) : archiveTask(task.id))}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                title={task.archivedAt ? 'Restaurar do arquivo' : 'Arquivar'}
                aria-label={task.archivedAt ? 'Restaurar do arquivo' : 'Arquivar'}
              >
                {task.archivedAt ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                title="Excluir"
                aria-label="Excluir demanda"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                aria-label="Fechar gaveta"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Attributes Bar */}
          <div className="px-4 sm:px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/50 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)] text-[11px] font-medium">Status:</span>
              <select
                value={task.status}
                onChange={(e) => changeTaskStatus(task.id, e.target.value as TaskStatus)}
                className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs font-semibold cursor-pointer focus:border-[var(--accent-primary)]"
              >
                {Object.keys(STATUS_STYLES).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)] text-[11px] font-medium">Prioridade:</span>
              <select
                value={task.priority}
                onChange={(e) => changeTaskPriority(task.id, e.target.value as TaskPriority)}
                className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs font-semibold cursor-pointer focus:border-[var(--accent-primary)]"
              >
                {['Crítica', 'Alta', 'Média', 'Baixa'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)] text-[11px] font-medium">Responsável:</span>
              <select
                value={task.assignee?.id || ''}
                onChange={(e) => {
                  const member = members.find((m) => m.id === e.target.value) || null;
                  updateTask(task.id, { assignee: member });
                }}
                className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs cursor-pointer focus:border-[var(--accent-primary)]"
              >
                <option value="">Sem responsável</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due date */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)] text-[11px] font-medium">Prazo:</span>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)] text-xs outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] px-4 sm:px-5 bg-[var(--bg-surface)] text-xs font-medium overflow-x-auto scrollbar-none">
            {(
              [
                { id: 'details', label: 'Detalhes', icon: Info },
                { id: 'comments', label: `Comentários (${task.comments.length})`, icon: MessageSquare },
                { id: 'subtasks', label: `Sub-tarefas (${task.subtasks.length})`, icon: CheckSquare },
                { id: 'time', label: 'Tempo', icon: Clock },
                { id: 'attachments', label: `Anexos (${task.attachments?.length ?? 0})`, icon: Paperclip },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 py-3 px-2.5 border-b-2 -mb-px transition-colors cursor-pointer shrink-0 ${
                  activeTab === id
                    ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs space-y-4">
            {activeTab === 'details' && <TaskDetailsTab task={task} />}
            {activeTab === 'time' && <TaskTimeTab task={task} />}
            {activeTab === 'attachments' && <TaskAttachmentsTab task={task} />}

            {/* TAB 1: Comments */}
            {activeTab === 'comments' && (
              <div className="flex flex-col h-full space-y-4">
                {/* Comments Feed */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {task.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-3.5 rounded-xl border transition-colors border-[var(--border-subtle)] ${
                        comm.isSystem ? 'bg-transparent' : 'bg-[var(--bg-canvas)]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2">
                          {comm.avatar ? (
                            <img src={comm.avatar} alt={comm.author} className="w-5 h-5 rounded-full" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[var(--bg-surface-active)] text-[var(--text-secondary)] font-semibold text-[10px] flex items-center justify-center">
                              {comm.author.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-[var(--text-primary)] text-xs">{comm.author}</span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
                          {comm.timestamp}
                        </span>
                      </div>

                      <p className="text-[var(--text-secondary)] leading-relaxed text-xs">{comm.text}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl p-2 shadow-xs">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                      placeholder="Adicionar nota ou comentário para a equipe..."
                      className="flex-1 bg-transparent text-[var(--text-primary)] outline-none text-xs px-2 placeholder-[var(--text-muted)]"
                    />
                    <Button variant="primary" size="sm" onClick={handleSendComment} aria-label="Enviar comentário">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Sub-tasks */}
            {activeTab === 'subtasks' && (
              <div className="space-y-4">
                {subtasksTotal > 0 && (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-primary)] font-medium">Progresso de Execução</span>
                      <span className="font-mono tabular-nums text-[var(--text-muted)]">
                        {completedSubtasks} de {subtasksTotal} ({subtasksPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${subtasksPercent}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl p-2">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="+ Adicionar sub-tarefa..."
                    className="flex-1 bg-transparent text-[var(--text-primary)] outline-none text-xs px-2 placeholder-[var(--text-muted)]"
                  />
                  <Button variant="primary" size="sm" onClick={handleAddSubtask}>
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-2">
                  {task.subtasks.map((st) => (
                    <label
                      key={st.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] cursor-pointer transition-colors"
                    >
                      <Checkbox checked={st.completed} onChange={() => toggleSubtask(task.id, st.id)} />
                      <span
                        className={`text-xs ${
                          st.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                  ))}

                  {task.subtasks.length === 0 && (
                    <p className="text-[var(--text-muted)] text-center py-6">Nenhuma sub-tarefa cadastrada.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
