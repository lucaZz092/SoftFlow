import React, { useState } from 'react';
import {
  X,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { AutomationTriggerType, AutomationActionType, TaskStatus } from '../types';

export const NewAutomationModal: React.FC = () => {
  const { isNewAutomationOpen, setIsNewAutomationOpen, addAutomation, groups } = useProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<AutomationTriggerType>('STATUS_CHANGE');
  const [targetStatus, setTargetStatus] = useState<TaskStatus>('Em Revisão');
  const [actionType, setActionType] = useState<AutomationActionType>('CODEX_GENERATE_TESTS');
  const [actionStatus, setActionStatus] = useState<TaskStatus>('Pronto');
  const [actionGroup, setActionGroup] = useState<string>(groups[0]?.id || 'group-marketing');

  if (!isNewAutomationOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let triggerLabel = 'Quando o evento acontecer';
    if (triggerType === 'STATUS_CHANGE') triggerLabel = `Quando o status mudar para "${targetStatus}"`;
    if (triggerType === 'GITHUB_PR_MERGED') triggerLabel = 'Quando um PR for mesclado no GitHub';
    if (triggerType === 'GITHUB_PR_OPENED') triggerLabel = 'Quando um novo PR for aberto no GitHub';
    if (triggerType === 'TASK_CREATED') triggerLabel = 'Quando uma nova demanda for criada';
    if (triggerType === 'PRIORITY_SET_CRITICAL') triggerLabel = 'Quando a prioridade for definida como Crítica';

    let actionLabel = 'Executar ação';
    let icon: 'claude' | 'codex' | 'github' | 'monday' = 'monday';

    if (actionType === 'CODEX_GENERATE_TESTS') {
      actionLabel = 'Gerar suíte de testes unitários com Codex';
      icon = 'codex';
    } else if (actionType === 'CLAUDE_REFINE') {
      actionLabel = 'Refinar critérios de aceite e histórias com Claude';
      icon = 'claude';
    } else if (actionType === 'GITHUB_CREATE_BRANCH') {
      actionLabel = 'Criar branch feature/ no repositório GitHub';
      icon = 'github';
    } else if (actionType === 'SET_STATUS') {
      actionLabel = `Alterar status para "${actionStatus}"`;
      icon = 'monday';
    } else if (actionType === 'MOVE_TO_GROUP') {
      const gTitle = groups.find((g) => g.id === actionGroup)?.title || 'outro grupo';
      actionLabel = `Mover para o grupo "${gTitle}"`;
      icon = 'monday';
    } else if (actionType === 'NOTIFY_TEAM') {
      actionLabel = 'Disparar notificação de bloqueio para o time';
      icon = 'monday';
    }

    addAutomation({
      name: name || `${triggerLabel} -> ${actionLabel}`,
      description: description || `Regra de fluxo contínuo configurada para acelerar a entrega da demanda.`,
      enabled: true,
      trigger: {
        type: triggerType,
        targetStatus: triggerType === 'STATUS_CHANGE' ? targetStatus : undefined,
        label: triggerLabel,
      },
      action: {
        type: actionType,
        label: actionLabel,
        targetStatus: actionType === 'SET_STATUS' ? actionStatus : undefined,
        targetGroupId: actionType === 'MOVE_TO_GROUP' ? actionGroup : undefined,
        integrationIcon: icon,
      },
    });

    setIsNewAutomationOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs select-none p-4">
      <div className="w-full max-w-lg bg-[#161922] border border-[#242936] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#212633] bg-[#141720] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Workflow className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Criar Nova Automação</h2>
              <p className="text-[11px] text-slate-400">Configure gatilhos e ações de fluxo contínuo</p>
            </div>
          </div>

          <button
            onClick={() => setIsNewAutomationOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Nome */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nome do Fluxo:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Quando status for Em Revisão -> Codex Gera Testes"
              className="w-full bg-[#1b1f2b] text-slate-200 px-3 py-1.5 rounded border border-[#272e3d] outline-none text-xs"
            />
          </div>

          {/* Builder Visual Block */}
          <div className="p-3.5 rounded-lg bg-[#191d27] border border-[#252b39] space-y-3">
            {/* QUANDO (Trigger) */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
                1. QUANDO [Gatilho de Disparo]:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as AutomationTriggerType)}
                  className="bg-[#1e2330] text-slate-200 px-2.5 py-1.5 rounded border border-[#293040] outline-none text-xs cursor-pointer"
                >
                  <option value="STATUS_CHANGE">Status da demanda mudar</option>
                  <option value="GITHUB_PR_MERGED">PR do GitHub for mesclado (Merged)</option>
                  <option value="GITHUB_PR_OPENED">Novo PR for aberto no GitHub</option>
                  <option value="TASK_CREATED">Nova demanda for criada</option>
                  <option value="PRIORITY_SET_CRITICAL">Prioridade for marcada como Crítica</option>
                </select>

                {triggerType === 'STATUS_CHANGE' && (
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as TaskStatus)}
                    className="bg-[#1e2330] text-slate-200 px-2.5 py-1.5 rounded border border-[#293040] outline-none text-xs font-semibold cursor-pointer"
                  >
                    <option value="Em Revisão">para "Em Revisão"</option>
                    <option value="Em andamento">para "Em andamento"</option>
                    <option value="Parado">para "Parado"</option>
                    <option value="Pronto">para "Pronto"</option>
                    <option value="A Fazer">para "A Fazer"</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 rotate-90" />
            </div>

            {/* ENTÃO (Action) */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                2. ENTÃO [Ação Automatizada]:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as AutomationActionType)}
                  className="bg-[#1e2330] text-slate-200 px-2.5 py-1.5 rounded border border-[#293040] outline-none text-xs cursor-pointer"
                >
                  <option value="CODEX_GENERATE_TESTS">⚡ Codex: Gerar testes unitários</option>
                  <option value="CLAUDE_REFINE">🤖 Claude: Refinar critérios de aceite</option>
                  <option value="GITHUB_CREATE_BRANCH">🐙 GitHub: Criar branch padronizada</option>
                  <option value="SET_STATUS">Mudar status da demanda</option>
                  <option value="MOVE_TO_GROUP">Mover para grupo</option>
                  <option value="NOTIFY_TEAM">Notificar responsáveis e equipe</option>
                </select>

                {actionType === 'SET_STATUS' && (
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value as TaskStatus)}
                    className="bg-[#1e2330] text-slate-200 px-2.5 py-1.5 rounded border border-[#293040] outline-none text-xs cursor-pointer"
                  >
                    <option value="Pronto">definir como Pronto</option>
                    <option value="Em andamento">definir como Em andamento</option>
                    <option value="Em Revisão">definir como Em Revisão</option>
                    <option value="Parado">definir como Parado</option>
                  </select>
                )}

                {actionType === 'MOVE_TO_GROUP' && (
                  <select
                    value={actionGroup}
                    onChange={(e) => setActionGroup(e.target.value)}
                    className="bg-[#1e2330] text-slate-200 px-2.5 py-1.5 rounded border border-[#293040] outline-none text-xs cursor-pointer"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsNewAutomationOpen(false)}
              className="px-3 py-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#0073ea] hover:bg-[#0062c7] text-white font-semibold cursor-pointer shadow-xs"
            >
              Ativar Automação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
