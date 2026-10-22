import React from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const AiSuggestionModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, simulateClaudeRefine, tasks } = useProject();

  if (!isAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs select-none p-4">
      <div className="w-full max-w-lg bg-[#161922] border border-[#242936] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#212633] bg-[#141720] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sugestões de Otimização do Quadro</h2>
              <p className="text-[11px] text-slate-400">Diagnóstico preditivo baseado no fluxo de trabalho atual</p>
            </div>
          </div>

          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content suggestions */}
        <div className="p-5 space-y-3.5 text-xs overflow-y-auto max-h-[70vh]">
          {/* Suggestion 1: Blocker analysis */}
          <div className="p-3.5 rounded-lg bg-[#181b24] border border-rose-500/30 space-y-2">
            <div className="flex items-center space-x-1.5 text-rose-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Gargalo Detectado: Demandas Estagnadas</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              As demandas <strong className="text-white">"Captação B2B"</strong> e <strong className="text-white">"Post Instagram"</strong> estão com status <strong className="text-rose-400">Parado</strong> com prazo de entrega próximo.
            </p>
            <div className="pt-0.5">
              <button
                onClick={() => {
                  const target = tasks.find((t) => t.status === 'Parado') || tasks[0];
                  if (target) simulateClaudeRefine(target.id);
                  setIsAiModalOpen(false);
                }}
                className="px-3 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/30 font-medium transition-colors cursor-pointer"
              >
                Acionar Claude para Desbloquear &amp; Refinar
              </button>
            </div>
          </div>

          {/* Suggestion 2: Automation Recommendation */}
          <div className="p-3.5 rounded-lg bg-[#181b24] border border-blue-500/30 space-y-2">
            <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Automação Recomendada: Testes Unitários Automáticos</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              O fluxo de testes com <strong className="text-amber-400">Codex</strong> garante cobertura de 100% dos cenários de borda antes da aprovação do Pull Request no GitHub.
            </p>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Regra de automação ativa na esteira</span>
            </div>
          </div>

          {/* Suggestion 3: Backlog Refinement */}
          <div className="p-3.5 rounded-lg bg-[#181b24] border border-[#242936] space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>Refinamento em Massa de Critérios de Aceite</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Deseja que o Claude preencha critérios de aceite e estimativa de horas para as demandas que ainda não possuem especificação?
            </p>
            <button
              onClick={() => {
                tasks.forEach((t) => {
                  if (!t.integrations.claude) simulateClaudeRefine(t.id);
                });
                setIsAiModalOpen(false);
              }}
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
            >
              Refinar Demandas Pendentes
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#212633] bg-[#141720] flex items-center justify-end">
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="px-3 py-1.5 rounded bg-[#1e2330] hover:bg-[#252c3c] text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
