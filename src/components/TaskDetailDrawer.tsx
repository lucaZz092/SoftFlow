import React, { useState } from 'react';
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
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, TEAM_MEMBERS } from '../data/mockData';
import { TaskStatus, TaskPriority } from '../types';

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
  } = useProject();

  const [activeTab, setActiveTab] = useState<'comments' | 'subtasks' | 'github' | 'claude' | 'codex'>('comments');
  const [commentInput, setCommentInput] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl h-full bg-[#161922] border-l border-[#222733] shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#212633] bg-[#141720] flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-300">
                {taskGroup?.title}
              </span>
              <span className="text-slate-500 font-mono" aria-hidden="true">/</span>
              <span className="text-slate-400 font-mono text-[11px] tabular-nums">{task.id}</span>
            </div>

            <input
              type="text"
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="w-full text-base font-bold text-white bg-transparent border-b border-transparent hover:border-[#2b3243] focus:border-[#0073ea] outline-none pb-0.5"
            />
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Attributes Bar */}
        <div className="px-4 py-2.5 border-b border-[#212633] bg-[#171b25] flex flex-wrap items-center gap-3 text-xs">
          {/* Status */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              value={task.status}
              onChange={(e) => changeTaskStatus(task.id, e.target.value as TaskStatus)}
              className="bg-[#1e2330] text-white px-2 py-1 rounded border border-[#2b3243] outline-none text-xs font-semibold cursor-pointer"
            >
              {Object.keys(STATUS_CONFIG).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Prioridade:</span>
            <select
              value={task.priority}
              onChange={(e) => changeTaskPriority(task.id, e.target.value as TaskPriority)}
              className="bg-[#1e2330] text-white px-2 py-1 rounded border border-[#2b3243] outline-none text-xs font-semibold cursor-pointer"
            >
              {['Crítica', 'Alta', 'Média', 'Baixa'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Responsável:</span>
            <select
              value={task.assignee?.id || ''}
              onChange={(e) => {
                const member = TEAM_MEMBERS.find((m) => m.id === e.target.value) || null;
                updateTask(task.id, { assignee: member });
              }}
              className="bg-[#1e2330] text-white px-2 py-1 rounded border border-[#2b3243] outline-none text-xs cursor-pointer"
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
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Prazo:</span>
            <input
              type="date"
              value={task.dueDate}
              onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
              className="bg-[#1e2330] text-slate-200 px-2 py-1 rounded border border-[#2b3243] text-xs outline-none"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#212633] px-4 bg-[#141720] text-xs font-medium">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'comments'
                ? 'border-[#0073ea] text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Atualizações ({task.comments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subtasks')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'subtasks'
                ? 'border-[#0073ea] text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Sub-tarefas ({task.subtasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'border-purple-500 text-purple-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>GitHub PR</span>
          </button>

          <button
            onClick={() => setActiveTab('claude')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'claude'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Claude</span>
          </button>

          <button
            onClick={() => setActiveTab('codex')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'codex'
                ? 'border-amber-500 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Codex</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4">
          {/* TAB 1: Comments */}
          {activeTab === 'comments' && (
            <div className="flex flex-col h-full space-y-3.5">
              {/* Description */}
              <div className="p-3 rounded-lg bg-[#181b24] border border-[#242936] space-y-1">
                <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider block">Descrição</span>
                <textarea
                  rows={2}
                  value={task.description}
                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                  className="w-full bg-transparent text-slate-200 outline-none resize-none text-xs leading-relaxed"
                />
              </div>

              {/* Comments Feed */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {task.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-lg border ${
                      comm.isAi
                        ? comm.aiModel === 'Codex'
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : comm.aiModel === 'Claude'
                          ? 'bg-indigo-950/20 border-indigo-500/30'
                          : 'bg-purple-950/20 border-purple-500/30'
                        : 'bg-[#181b24] border-[#242936]'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
                      <div className="flex items-center space-x-2">
                        {comm.isAi ? (
                          <span className="p-1 rounded bg-[#1e2330] text-white">
                            {comm.aiModel === 'Codex' ? (
                              <Zap className="w-3 h-3 text-amber-400" />
                            ) : comm.aiModel === 'Claude' ? (
                              <Bot className="w-3 h-3 text-indigo-400" />
                            ) : (
                              <GitBranch className="w-3 h-3 text-purple-400" />
                            )}
                          </span>
                        ) : comm.avatar ? (
                          <img src={comm.avatar} alt={comm.author} className="w-4.5 h-4.5 rounded-full" />
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full bg-[#0073ea] text-white font-bold text-[9px] flex items-center justify-center">
                            LM
                          </div>
                        )}
                        <span className="font-bold text-white text-xs">{comm.author}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums">{comm.timestamp}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-xs">{comm.text}</p>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="pt-1">
                <div className="flex items-center space-x-2 bg-[#181b24] border border-[#242936] rounded-md p-1.5">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                    placeholder="Adicionar nota ou comentário para a equipe..."
                    className="flex-1 bg-transparent text-slate-200 outline-none text-xs px-1"
                  />
                  <button
                    onClick={handleSendComment}
                    className="p-1.5 bg-[#0073ea] hover:bg-[#0062c7] text-white rounded transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sub-tasks */}
          {activeTab === 'subtasks' && (
            <div className="space-y-3.5">
              {subtasksTotal > 0 && (
                <div className="p-3 rounded-lg bg-[#181b24] border border-[#242936] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Progresso de Execução</span>
                    <span className="font-mono tabular-nums text-slate-400">{completedSubtasks} de {subtasksTotal} ({subtasksPercent}%)</span>
                  </div>
                  <div className="w-full bg-[#1e2330] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${subtasksPercent}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 bg-[#181b24] border border-[#242936] rounded-md p-1.5">
                <input
                  type="text"
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="+ Adicionar sub-tarefa..."
                  className="flex-1 bg-transparent text-slate-200 outline-none text-xs px-1"
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-2.5 py-1 bg-[#0073ea] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-1.5">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className="flex items-center space-x-2.5 p-2 rounded-md bg-[#181b24] hover:bg-[#1f2430] border border-[#242936] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => {}}
                      className="rounded bg-[#1e2330] border-[#2b3243] text-blue-500 cursor-pointer"
                    />
                    <span className={`text-xs ${st.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {st.title}
                    </span>
                  </div>
                ))}

                {task.subtasks.length === 0 && (
                  <p className="text-slate-500 text-center py-4">Nenhuma sub-tarefa cadastrada.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GitHub Integration */}
          {activeTab === 'github' && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[#181b24] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white text-xs">Vínculo de Repositório &amp; Pull Request</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] uppercase">
                    {task.integrations.github?.prStatus || 'Branch Conectada'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Repositório:</span>
                    <div className="font-mono text-white text-[11px] truncate">
                      {task.integrations.github?.repo || 'preventsenior/soft-solutions-core'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Branch:</span>
                    <div className="font-mono text-purple-300 text-[11px] truncate">
                      {task.integrations.github?.branch || `feature/${task.id}-dev`}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Pull Request:</span>
                    <div className="font-medium text-white truncate">
                      #{task.integrations.github?.prNumber || 42} - {task.integrations.github?.prTitle || task.title}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status Checks CI:</span>
                    <div className="text-emerald-400 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Checks Aprovados</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Claude Integration */}
          {activeTab === 'claude' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-xs">
                    Refinamento Ágil com Claude
                  </span>
                </div>
                <button
                  onClick={() => simulateClaudeRefine(task.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Refinar Demanda</span>
                </button>
              </div>

              {task.integrations.claude ? (
                <div className="p-4 rounded-lg bg-[#181b24] border border-indigo-500/30 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1">História de Usuário:</span>
                    <p className="text-slate-200 italic font-serif leading-relaxed">"{task.integrations.claude.userStory}"</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1">Critérios de Aceite:</span>
                    <ul className="space-y-1">
                      {task.integrations.claude.acceptanceCriteria?.map((crit, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center space-x-4 pt-2 border-t border-[#252c38] text-[11px] text-slate-400">
                    <span>Complexidade: <strong className="text-white">{task.integrations.claude.complexityScore || 'M'}</strong></span>
                    <span>Estimativa: <strong className="text-white">{task.integrations.claude.estimatedHours || 6}h</strong></span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 border border-dashed border-[#282d38] rounded-lg space-y-2">
                  <Bot className="w-5 h-5 mx-auto text-indigo-400" />
                  <p>Nenhum refinamento gerado ainda para esta demanda.</p>
                  <button
                    onClick={() => simulateClaudeRefine(task.id)}
                    className="text-xs text-indigo-400 hover:underline cursor-pointer"
                  >
                    Clique para acionar o Claude
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Codex Integration */}
          {activeTab === 'codex' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">
                    Engenharia de Testes com Codex
                  </span>
                </div>
                <button
                  onClick={() => simulateCodexTestGeneration(task.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors cursor-pointer text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Gerar Testes</span>
                </button>
              </div>

              {task.integrations.codex ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Revisão de Código Concluída</div>
                      <div className="text-[11px] text-slate-400">{task.integrations.codex.reviewSummary}</div>
                    </div>
                    <span className="text-emerald-400 font-semibold text-xs">Testes Aprovados</span>
                  </div>

                  {task.integrations.codex.generatedTests && (
                    <div className="rounded-lg bg-[#12141a] border border-[#242936] overflow-hidden">
                      <div className="px-3 py-1.5 bg-[#171a23] border-b border-[#212633] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">suite.test.ts (Vitest)</span>
                        <button
                          onClick={() => handleCopyCode(task.integrations.codex?.generatedTests || '')}
                          className="flex items-center space-x-1 text-[11px] text-slate-300 hover:text-white cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                        {task.integrations.codex.generatedTests}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 border border-dashed border-[#282d38] rounded-lg space-y-2">
                  <Zap className="w-5 h-5 mx-auto text-amber-400" />
                  <p>Nenhum teste gerado ainda pelo Codex.</p>
                  <button
                    onClick={() => simulateCodexTestGeneration(task.id)}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    Gerar suite de testes unitários com Codex
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
