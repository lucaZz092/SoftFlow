import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bot,
  Workflow,
  Star,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Home,
  FileSpreadsheet,
  BarChart3,
  GitBranch,
  Layers,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const NavigationSidebar: React.FC = () => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const { currentView, setCurrentView, automations, setIsIntegrationsOpen } = useProject();

  const activeAutomationsCount = automations.filter((a) => a.enabled).length;

  return (
    <aside className="flex h-screen select-none border-r border-[#222733] bg-[#12141a] z-20 shrink-0">
      {/* Primary Ultra-Slim Icon Rail (Monday style) */}
      <div className="w-[50px] flex flex-col items-center justify-between py-3 border-r border-[#202530] bg-[#141720]">
        <div className="flex flex-col items-center space-y-3.5">
          {/* Logo icon */}
          <div
            onClick={() => setCurrentView('table')}
            className="w-8 h-8 rounded-md bg-[#0073ea] flex items-center justify-center shadow-sm cursor-pointer transition-transform hover:scale-105"
            title="SoftFlow Workspace"
          >
            <span className="font-extrabold text-white text-xs tracking-tight">SF</span>
          </div>

          <div className="w-6 h-px bg-[#262c3a]" />

          {/* Navigation icons */}
          <button
            onClick={() => setCurrentView('table')}
            className={`w-9 h-9 rounded-md flex flex-col items-center justify-center transition-all ${
              currentView === 'table'
                ? 'bg-[#0073ea] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#1f2430]'
            }`}
            title="Quadro Principal"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[8px] mt-0.5 tracking-tight font-medium">Quadro</span>
          </button>

          <button
            onClick={() => setCurrentView('automations')}
            className={`w-9 h-9 rounded-md flex flex-col items-center justify-center transition-all relative ${
              currentView === 'automations'
                ? 'bg-[#0073ea] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#1f2430]'
            }`}
            title="Fluxos de Automação"
          >
            <Workflow className="w-4 h-4" />
            <span className="text-[8px] mt-0.5 tracking-tight font-medium">Fluxos</span>
            {activeAutomationsCount > 0 && (
              <span className="absolute 1 top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 text-slate-950 text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeAutomationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsIntegrationsOpen(true)}
            className="w-9 h-9 rounded-md flex flex-col items-center justify-center text-slate-400 hover:text-white hover:bg-[#1f2430] transition-all"
            title="Conexões: GitHub, Claude, Codex"
          >
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span className="text-[8px] mt-0.5 tracking-tight font-medium">Git/IA</span>
          </button>

          <button
            onClick={() => setCurrentView('kanban')}
            className={`w-9 h-9 rounded-md flex flex-col items-center justify-center transition-all ${
              currentView === 'kanban'
                ? 'bg-[#0073ea] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#1f2430]'
            }`}
            title="Kanban Ágil"
          >
            <Layers className="w-4 h-4" />
            <span className="text-[8px] mt-0.5 tracking-tight font-medium">Kanban</span>
          </button>

          <button
            onClick={() => setCurrentView('metrics')}
            className={`w-9 h-9 rounded-md flex flex-col items-center justify-center transition-all ${
              currentView === 'metrics'
                ? 'bg-[#0073ea] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#1f2430]'
            }`}
            title="Painéis e Relatórios"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[8px] mt-0.5 tracking-tight font-medium">Painéis</span>
          </button>
        </div>

        {/* Bottom utility icons */}
        <div className="flex flex-col items-center space-y-2 text-slate-400">
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:text-white hover:bg-[#1f2430] transition-colors"
            title="Favoritos"
          >
            <Star className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:text-white hover:bg-[#1f2430] transition-colors"
            title="Mais opções"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <div className="w-7 h-7 rounded-full bg-[#0073ea] text-white font-bold text-xs flex items-center justify-center border border-white/10">
            S
          </div>
        </div>
      </div>

      {/* Secondary Workspace Panel (collapsible) */}
      <div
        className={`transition-all duration-200 ease-in-out flex flex-col bg-[#151821] ${
          isWorkspaceOpen ? 'w-56 opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* Workspace panel header */}
        <div className="h-12 border-b border-[#212633] px-3.5 flex items-center justify-between text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold tracking-wide text-slate-300">Área de trabalho</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsWorkspaceOpen(false)}
              className="p-1 rounded hover:bg-[#202532] text-slate-400 hover:text-white transition-colors"
              title="Recolher painel"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Workspace current card */}
        <div className="p-2 border-b border-[#202532]">
          <div className="flex items-center justify-between p-2 rounded-md bg-[#1d222e] hover:bg-[#232938] cursor-pointer transition-colors border border-[#272e3d]">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-5 h-5 rounded bg-rose-500/90 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                <Home className="w-3 h-3" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">SoftSolutions</div>
                <div className="text-[10px] text-slate-400">Workspace Principal</div>
              </div>
            </div>
            <Plus className="w-3.5 h-3.5 text-slate-400 hover:text-white shrink-0 ml-1" />
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
          {/* Meus agentes */}
          <div>
            <div className="flex items-center justify-between px-2 text-slate-400 font-semibold text-[11px] py-1">
              <span className="flex items-center space-x-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>Agentes de Engenharia</span>
              </span>
            </div>
            <div className="mt-1 pl-3 space-y-0.5">
              <div
                onClick={() => setIsIntegrationsOpen(true)}
                className="flex items-center justify-between px-2 py-1.5 rounded text-slate-300 hover:bg-[#1d222e] hover:text-white cursor-pointer transition-colors"
              >
                <span className="text-[11px]">Claude (User Stories)</span>
                <span className="text-[9px] text-slate-500 font-mono">v3.5</span>
              </div>
              <div
                onClick={() => setIsIntegrationsOpen(true)}
                className="flex items-center justify-between px-2 py-1.5 rounded text-slate-300 hover:bg-[#1d222e] hover:text-white cursor-pointer transition-colors"
              >
                <span className="text-[11px]">Codex (Testes &amp; Review)</span>
                <span className="text-[9px] text-slate-500 font-mono">Vitest</span>
              </div>
            </div>
          </div>

          {/* Conteúdo Section */}
          <div>
            <div className="flex items-center justify-between px-2 text-slate-400 font-semibold text-[11px] py-1">
              <span>Quadros &amp; Relatórios</span>
              <Plus className="w-3 h-3 hover:text-white cursor-pointer" />
            </div>

            <div className="mt-1 space-y-0.5">
              {/* SoftSolutions (Active board) */}
              <button
                onClick={() => setCurrentView('table')}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                  currentView === 'table'
                    ? 'bg-[#0073ea]/20 text-[#579bfc] font-semibold border border-[#0073ea]/40'
                    : 'text-slate-300 hover:bg-[#1d222e] hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">SoftSolutions</span>
              </button>

              {/* Fluxos de Automação */}
              <button
                onClick={() => setCurrentView('automations')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                  currentView === 'automations'
                    ? 'bg-[#0073ea]/20 text-[#579bfc] font-semibold border border-[#0073ea]/40'
                    : 'text-slate-300 hover:bg-[#1d222e] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Workflow className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Automações</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                  {activeAutomationsCount}
                </span>
              </button>

              {/* Painéis e relatórios */}
              <button
                onClick={() => setCurrentView('metrics')}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                  currentView === 'metrics'
                    ? 'bg-[#0073ea]/20 text-[#579bfc] font-semibold border border-[#0073ea]/40'
                    : 'text-slate-300 hover:bg-[#1d222e] hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Métricas de Entrega</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#212633] bg-[#13161e] flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-400 font-medium">GitHub Sincronizado</span>
          <span className="text-[10px] text-slate-500 font-mono">main</span>
        </div>
      </div>

      {/* Button to expand workspace if collapsed */}
      {!isWorkspaceOpen && (
        <button
          onClick={() => setIsWorkspaceOpen(true)}
          className="absolute left-[50px] top-4 z-30 p-1 bg-[#1d222e] text-slate-300 hover:text-white rounded-r border border-l-0 border-[#272e3d] shadow-sm"
          title="Expandir barra lateral"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </aside>
  );
};
