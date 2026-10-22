import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MessageSquare,
  GitBranch,
  Bot,
  Zap,
  CheckSquare,
  Send,
  Sparkles,
  Copy,
  Check,
  Play,
  CheckCircle2,
  GitPullRequest,
  Plus,
  Clock,
  User,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { STATUS_STYLES, PRIORITY_STYLES } from '../styles/designSystem';
import { TEAM_MEMBERS } from '../data/mockData';
import { TaskStatus, TaskPriority } from '../types';
import { Button } from './ui/Button';

export const TaskDetailDrawer: React.FC = () => {
  const {
    tasks,
    groups,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    changeTaskStatus,
    changeTaskPriority,
    toggleSubtask,
    addSubtask,
    addComment,
    simulateClaudeRefine,
    simulateCodexTestGeneration,
    createGitHubBranch,
    createGitHubPR,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'comments' | 'subtasks' | 'github' | 'claude' | 'codex'>('comments');
  const [commentInput, setCommentInput] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Custom branch / PR inputs
  const [newBranchInput, setNewBranchInput] = useState('');
  const [newPrTitleInput, setNewPrTitleInput] = useState('');

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

  const task = tasks.find((t) => t.id === selectedTaskId);
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateBranchAction = () => {
    const branch =
      newBranchInput.trim() ||
      `feature/${task.id.slice(-4)}-${task.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .slice(0, 15)}`;
    createGitHubBranch(task.id, branch);
    setNewBranchInput('');
  };

  const handleCreatePRAction = () => {
    const title = newPrTitleInput.trim() || `feat: ${task.title}`;
    const branch = task.integrations.github?.branch || `feature/${task.id.slice(-4)}`;
    createGitHubPR(task.id, title, branch);
    setNewPrTitleInput('');
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
                className="w-full text-base sm:text-lg font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[#0066ff] outline-none pb-0.5 transition-colors"
                title="Editar título da demanda"
              />
            </div>

            <button
              type="button"
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
              aria-label="Fechar gaveta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Attributes Bar */}
          <div className="px-4 sm:px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/50 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)] text-[11px] font-medium">Status:</span>
              <select
                value={task.status}
                onChange={(e) => changeTaskStatus(task.id, e.target.value as TaskStatus)}
                className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs font-semibold cursor-pointer focus:border-[#0066ff]"
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
                className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs font-semibold cursor-pointer focus:border-[#0066ff]"
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
                  const member = TEAM_MEMBERS.find((m) => m.id === e.target.value) || null;
                  updateTask(task.id, { assignee: member });
                }}
                className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] outline-none text-xs cursor-pointer focus:border-[#0066ff]"
              >
                <option value="">Sem responsável</option>
                {TEAM_MEMBERS.map((m) => (
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
                className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)] text-xs outline-none focus:border-[#0066ff]"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center border-b border-[var(--border-subtle)] px-4 sm:px-5 bg-[var(--bg-surface)] text-xs font-medium overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'comments'
                  ? 'border-[#0066ff] text-[#0066ff] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Atualizações ({task.comments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subtasks')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'subtasks'
                  ? 'border-[#0066ff] text-[#0066ff] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Sub-tarefas ({task.subtasks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'github'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-500" />
              <span>GitHub PR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('claude')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'claude'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span>Claude Stories</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('codex')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'codex'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Codex Testes</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs space-y-4">
            {/* TAB 1: Comments */}
            {activeTab === 'comments' && (
              <div className="flex flex-col h-full space-y-4">
                {/* Description */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1.5">
                  <span className="font-semibold text-[var(--text-muted)] uppercase text-[10px] tracking-wider block">
                    Descrição da Demanda
                  </span>
                  <textarea
                    rows={2}
                    value={task.description}
                    onChange={(e) => updateTask(task.id, { description: e.target.value })}
                    className="w-full bg-transparent text-[var(--text-primary)] outline-none resize-none text-xs leading-relaxed"
                    placeholder="Adicione uma descrição detalhada..."
                  />
                </div>

                {/* Comments Feed */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {task.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        comm.isAi
                          ? comm.aiModel === 'Codex'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : comm.aiModel === 'Claude'
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2">
                          {comm.isAi ? (
                            <span className="p-1 rounded-md bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                              {comm.aiModel === 'Codex' ? (
                                <Zap className="w-3 h-3 text-amber-500" />
                              ) : comm.aiModel === 'Claude' ? (
                                <Bot className="w-3 h-3 text-indigo-500" />
                              ) : (
                                <GitBranch className="w-3 h-3 text-purple-500" />
                              )}
                            </span>
                          ) : comm.avatar ? (
                            <img src={comm.avatar} alt={comm.author} className="w-5 h-5 rounded-full" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[#0066ff] text-white font-bold text-[10px] flex items-center justify-center">
                              LM
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
                    <div
                      key={st.id}
                      onClick={() => toggleSubtask(task.id, st.id)}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => {}}
                        className="rounded border-[var(--border-subtle)] text-[#0066ff] cursor-pointer"
                      />
                      <span
                        className={`text-xs ${
                          st.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>
                  ))}

                  {task.subtasks.length === 0 && (
                    <p className="text-[var(--text-muted)] text-center py-6">Nenhuma sub-tarefa cadastrada.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: GitHub Integration */}
            {activeTab === 'github' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-purple-500" />
                      <span className="font-bold text-[var(--text-primary)] text-xs">
                        Vínculo de Repositório &amp; Pull Request
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 uppercase font-semibold">
                      {task.integrations.github?.prStatus || 'Branch Conectada'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">
                        Repositório:
                      </span>
                      <div className="font-mono text-[var(--text-primary)] text-xs truncate">
                        {task.integrations.github?.repo || 'preventsenior/soft-solutions-core'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">Branch:</span>
                      <div className="font-mono text-purple-600 dark:text-purple-300 text-xs truncate">
                        {task.integrations.github?.branch || `feature/${task.id}-dev`}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">
                        Pull Request:
                      </span>
                      <div className="font-medium text-[var(--text-primary)] truncate">
                        #{task.integrations.github?.prNumber || 42} - {task.integrations.github?.prTitle || task.title}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">
                        Status Checks CI:
                      </span>
                      <div className="text-emerald-500 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Checks Aprovados</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Working GitHub Actions Bar */}
                <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-3.5">
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                    Ações Diretas no GitHub (via PAT)
                  </span>

                  {/* Create Branch */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[var(--text-muted)]">Criar Nova Branch Padronizada:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newBranchInput}
                        onChange={(e) => setNewBranchInput(e.target.value)}
                        placeholder={`feature/${task.id.slice(-4)}-sua-branch`}
                        className="flex-1 bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-mono outline-none focus:border-[#0066ff]"
                      />
                      <Button variant="secondary" size="sm" onClick={handleCreateBranchAction}>
                        Criar Branch
                      </Button>
                    </div>
                  </div>

                  {/* Open PR */}
                  <div className="space-y-1.5 pt-3 border-t border-[var(--border-subtle)]">
                    <span className="text-[11px] text-[var(--text-muted)]">Abrir Novo Pull Request:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPrTitleInput}
                        onChange={(e) => setNewPrTitleInput(e.target.value)}
                        placeholder={`feat: ${task.title}`}
                        className="flex-1 bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs outline-none focus:border-[#0066ff]"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCreatePRAction}
                        leftIcon={<GitPullRequest className="w-3 h-3" />}
                      >
                        Abrir PR
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Claude Integration */}
            {activeTab === 'claude' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-[var(--text-primary)] text-xs">
                      Refinamento Ágil com Claude 3.5 Sonnet
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => simulateClaudeRefine(task.id)}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Refinar Demanda Agora
                  </Button>
                </div>

                {task.integrations.claude ? (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                        História de Usuário Gerada:
                      </span>
                      <p className="text-[var(--text-primary)] italic font-serif leading-relaxed text-xs">
                        "{task.integrations.claude.userStory}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block mb-1.5">
                        Critérios de Aceite:
                      </span>
                      <ul className="space-y-1.5">
                        {task.integrations.claude.acceptanceCriteria?.map((crit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[var(--text-secondary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-4 pt-2.5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                      <span>
                        Complexidade:{' '}
                        <strong className="text-[var(--text-primary)]">
                          {task.integrations.claude.complexityScore || 'M'}
                        </strong>
                      </span>
                      <span>
                        Estimativa:{' '}
                        <strong className="text-[var(--text-primary)]">
                          {task.integrations.claude.estimatedHours || 6}h
                        </strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl space-y-2">
                    <Bot className="w-6 h-6 mx-auto text-indigo-500" />
                    <p className="text-xs">Nenhum refinamento gerado ainda para esta demanda.</p>
                    <Button variant="ghost" size="sm" onClick={() => simulateClaudeRefine(task.id)}>
                      Clique para acionar o Claude
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Codex Integration */}
            {activeTab === 'codex' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-[var(--text-primary)] text-xs">
                      Engenharia de Testes com Codex (Vitest)
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => simulateCodexTestGeneration(task.id)}
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                  >
                    Gerar Testes Agora
                  </Button>
                </div>

                {task.integrations.codex ? (
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">Revisão de Código Concluída</div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {task.integrations.codex.reviewSummary}
                        </div>
                      </div>
                      <span className="text-emerald-500 font-semibold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprovados</span>
                      </span>
                    </div>

                    {task.integrations.codex.generatedTests && (
                      <div className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-hidden shadow-xs">
                        <div className="px-3.5 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                              suite.test.ts (Vitest)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(task.integrations.codex?.generatedTests || '')}
                            className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer px-2 py-0.5 rounded hover:bg-[var(--bg-surface-hover)] transition-colors"
                          >
                            {copiedCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto leading-relaxed bg-[var(--bg-canvas)]">
                          {task.integrations.codex.generatedTests}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl space-y-2">
                    <Zap className="w-6 h-6 mx-auto text-amber-500" />
                    <p className="text-xs">Nenhum teste gerado ainda pelo Codex.</p>
                    <Button variant="ghost" size="sm" onClick={() => simulateCodexTestGeneration(task.id)}>
                      Gerar suite de testes unitários com Codex
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
