import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bot,
  Workflow,
  Star,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  FileSpreadsheet,
  BarChart3,
  GitBranch,
  Layers,
  Calendar,
  X,
  CheckCircle2,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const NavigationSidebar: React.FC = () => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const {
    currentView,
    setCurrentView,
    automations,
    setIsIntegrationsOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isGithubConnected,
    tasks,
  } = useProject();

  const activeAutomationsCount = automations.filter((a) => a.enabled).length;
  const inProgressCount = tasks.filter((t) => t.status === 'Trabalhando nisso' || t.status === 'Em Revisão').length;

  const handleNavClick = (view: typeof currentView) => {
    setCurrentView(view);
    setIsMobileSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full select-none">
      {/* Primary Slim Icon Rail */}
      <div className="w-14 flex flex-col items-center justify-between py-3.5 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0">
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Logo icon */}
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className="w-8 h-8 rounded-lg bg-[#0066ff] flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-sm hover:scale-105 active:scale-95 transition-transform"
            title="SoftFlow Workspace"
          >
            SF
          </button>

          <div className="w-8 h-px bg-[var(--border-subtle)] my-1" />

          {/* Navigation icons */}
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative ${
              currentView === 'overview'
                ? 'bg-[#0066ff] text-white shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
            title="Visão Geral (Dashboard)"
            aria-label="Visão Geral"
          >
            <Compass className="w-4 h-4" />
            <span className="text-[9px] tracking-tight">Início</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('table')}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative ${
              currentView === 'table'
                ? 'bg-[#0066ff] text-white shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
            title="Quadro Principal (Tabela)"
            aria-label="Quadro Principal"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px] tracking-tight">Quadro</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('kanban')}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              currentView === 'kanban'
                ? 'bg-[#0066ff] text-white shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
            title="Visualização Kanban"
            aria-label="Kanban"
          >
            <Layers className="w-4 h-4" />
            <span className="text-[9px] tracking-tight">Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('timeline')}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              currentView === 'timeline'
                ? 'bg-[#0066ff] text-white shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
            title="Cronograma &amp; Linha do Tempo"
            aria-label="Cronograma"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[9px] tracking-tight">Gantt</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('automations')}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative ${
              currentView === 'automations'
                ? 'bg-[#0066ff] text-white shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
            title="Fluxos de Automação"
            aria-label="Automações"
          >
            <Workflow className="w-4 h-4" />
            <span className="text-[9px] tracking-tight">Fluxos</span>
            {activeAutomationsCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 text-slate-950 text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeAutomationsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsIntegrationsOpen(true);
              setIsMobileSidebarOpen(false);
            }}
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer"
            title="Conexões: GitHub, Claude, Codex"
            aria-label="Integrações Git e IA"
          >
            <GitBranch className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] tracking-tight">Git/IA</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('metrics')}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              currentView === 'metrics'
                ? 'bg-[#0066ff] text-white shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
            title="Métricas &amp; Painéis"
            aria-label="Métricas"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[9px] tracking-tight">Painéis</span>
          </button>
        </div>

        {/* Bottom utility icons */}
        <div className="flex flex-col items-center gap-2 text-[var(--text-secondary)]">
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            title="Favoritos"
            aria-label="Favoritos"
          >
            <Star className="w-3.5 h-3.5" />
          </button>
          <div
            className="w-7 h-7 rounded-lg bg-[#0066ff] text-white font-semibold text-xs flex items-center justify-center border border-white/20 shadow-xs cursor-pointer"
            title="Workspace SoftFlow"
          >
            SF
          </div>
        </div>
      </div>

      {/* Secondary Workspace Panel (collapsible on desktop, full inside mobile drawer) */}
      <div
        className={`transition-all duration-200 ease-in-out flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] ${
          isWorkspaceOpen ? 'w-56 sm:w-60 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0'
        }`}
      >
        {/* Workspace panel header */}
        <div className="h-12 border-b border-[var(--border-subtle)] px-3.5 flex items-center justify-between text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Área de Trabalho
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsWorkspaceOpen(false)}
              className="hidden md:inline-flex p-1 rounded-md hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Recolher painel"
              aria-label="Recolher painel lateral"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 rounded-md hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace current card */}
        <div className="p-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              <div className="w-6 h-6 rounded-md bg-blue-600/15 border border-blue-600/30 flex items-center justify-center text-[#0066ff] text-xs font-bold shrink-0">
                <Home className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[var(--text-primary)] truncate">SoftSolutions</div>
                <div className="text-[11px] text-[var(--text-muted)]">Time de Core Dev</div>
              </div>
            </div>
            {inProgressCount > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-[#0066ff] border border-blue-500/20 tabular-nums">
                {inProgressCount} ativas
              </span>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
          {/* Engineering AI Agents */}
          <div>
            <div className="flex items-center justify-between px-2 text-[var(--text-muted)] font-semibold text-[11px] uppercase tracking-wider py-1">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#0066ff]" />
                <span>Agentes de Engenharia</span>
              </span>
            </div>
            <div className="mt-1 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsIntegrationsOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] cursor-pointer transition-colors text-left"
              >
                <span className="text-xs font-medium">Claude 3.5 Sonnet</span>
                <span className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-1 rounded">Ativo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsIntegrationsOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] cursor-pointer transition-colors text-left"
              >
                <span className="text-xs font-medium">Codex Vitest TestGen</span>
                <span className="text-[10px] text-[#0066ff] font-mono bg-[#0066ff]/10 px-1 rounded">Vitest</span>
              </button>
            </div>
          </div>

          {/* Views & Boards */}
          <div>
            <div className="flex items-center justify-between px-2 text-[var(--text-muted)] font-semibold text-[11px] uppercase tracking-wider py-1">
              <span>Quadros &amp; Relatórios</span>
            </div>

            <div className="mt-1 space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick('overview')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'overview'
                    ? 'bg-[#0066ff]/10 text-[#0066ff] font-semibold border border-[#0066ff]/30 dark:text-[#3385ff]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Compass className="w-3.5 h-3.5 text-[#0066ff] shrink-0" />
                  <span className="truncate">Visão Geral (Início)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('table')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'table'
                    ? 'bg-[#0066ff]/10 text-[#0066ff] font-semibold border border-[#0066ff]/30 dark:text-[#3385ff]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#0066ff] shrink-0" />
                  <span className="truncate">Demandas Principais</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
                  {tasks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('kanban')}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'kanban'
                    ? 'bg-[#0066ff]/10 text-[#0066ff] font-semibold border border-[#0066ff]/30 dark:text-[#3385ff]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">Kanban de Desenvolvimento</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('timeline')}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'timeline'
                    ? 'bg-[#0066ff]/10 text-[#0066ff] font-semibold border border-[#0066ff]/30 dark:text-[#3385ff]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Cronograma de Sprints</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('automations')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'automations'
                    ? 'bg-[#0066ff]/10 text-[#0066ff] font-semibold border border-[#0066ff]/30 dark:text-[#3385ff]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Workflow className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Central de Automações</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold tabular-nums">
                  {activeAutomationsCount} ativas
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('metrics')}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'metrics'
                    ? 'bg-[#0066ff]/10 text-[#0066ff] font-semibold border border-[#0066ff]/30 dark:text-[#3385ff]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="truncate">Métricas de Engenharia</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info: GitHub status */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isGithubConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[11px] font-medium text-[var(--text-primary)]">GitHub PAT</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">main branch</span>
        </div>
      </div>

      {/* Button to expand workspace if collapsed on desktop */}
      {!isWorkspaceOpen && (
        <button
          type="button"
          onClick={() => setIsWorkspaceOpen(true)}
          className="hidden md:flex absolute left-14 top-4 z-30 p-1 bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-r-md border border-l-0 border-[var(--border-subtle)] shadow-xs transition-colors"
          title="Expandir painel de trabalho"
          aria-label="Expandir painel"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex h-[calc(100vh-3rem)] z-20 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 flex h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
