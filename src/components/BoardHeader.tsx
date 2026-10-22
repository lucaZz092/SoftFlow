import React from 'react';
import {
  ChevronDown,
  Sparkles,
  Link2,
  Workflow,
  Bot,
  UserPlus,
  Table,
  Kanban,
  Calendar,
  BarChart2,
  Plus
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from '../types';

export const BoardHeader: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    automations,
    setIsIntegrationsOpen,
    setIsNewAutomationOpen,
    setIsAiModalOpen,
  } = useProject();

  const activeAutomationsCount = automations.filter((a) => a.enabled).length;

  const views: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'table', label: 'Quadro principal', icon: <Table className="w-3.5 h-3.5" /> },
    { id: 'kanban', label: 'Kanban', icon: <Kanban className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Cronograma', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'automations', label: 'Automações de Fluxo', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'metrics', label: 'Painéis e Métricas', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="border-b border-[#212633] bg-[#161922] select-none pt-3 px-5 pb-0">
      {/* Top Row: Board Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5">
        {/* Title dropdown */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-lg font-bold text-white tracking-tight cursor-pointer hover:text-slate-200 transition-colors">
            <span>SoftSolutions</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-slate-500 text-xs" aria-hidden="true">·</span>
          <span className="text-xs text-slate-400 font-medium">Gestão de Demandas &amp; Engenharia</span>
        </div>

        {/* Right buttons */}
        <div className="flex items-center space-x-2">
          {/* Sugestão de IA */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-200 hover:text-white bg-[#1e2330] hover:bg-[#262c3b] border border-[#2b3243] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Sugestões de IA</span>
          </button>

          {/* Integrar */}
          <button
            onClick={() => setIsIntegrationsOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-200 hover:text-white bg-[#1e2330] hover:bg-[#262c3b] border border-[#2b3243] transition-colors whitespace-nowrap cursor-pointer"
            title="GitHub, Claude, Codex"
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Integrar</span>
          </button>

          {/* Automatizar */}
          <button
            onClick={() => setCurrentView('automations')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-200 hover:text-white bg-[#1e2330] hover:bg-[#262c3b] border border-[#2b3243] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Workflow className="w-3.5 h-3.5 text-amber-400" />
            <span>Automatizar</span>
            {activeAutomationsCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-blue-400 font-bold ml-0.5">
                ({activeAutomationsCount})
              </span>
            )}
          </button>

          {/* Agents */}
          <button
            onClick={() => setIsIntegrationsOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-200 hover:text-white bg-[#1e2330] hover:bg-[#262c3b] border border-[#2b3243] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agentes</span>
          </button>

          {/* Convidar */}
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#1e2330] hover:bg-[#262c3b] text-slate-200 border border-[#2b3243] transition-colors whitespace-nowrap cursor-pointer">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Convidar</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: View Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pt-0.5">
        {views.map((v) => {
          const isActive = currentView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setCurrentView(v.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-[#0073ea] text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1e28]'
              }`}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsNewAutomationOpen(true)}
          className="flex items-center space-x-1 px-2.5 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Nova automação"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
