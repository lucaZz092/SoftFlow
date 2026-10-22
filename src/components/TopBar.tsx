import React from 'react';
import {
  Search,
  Bell,
  Inbox,
  HelpCircle,
  Zap,
  Menu,
  Sun,
  Moon,
  Github,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const TopBar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    setIsIntegrationsOpen,
    theme,
    toggleTheme,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isGithubConnected,
  } = useProject();

  const viewLabels: Record<string, string> = {
    overview: 'Visão Geral',
    table: 'Quadro Principal',
    kanban: 'Kanban Ágil',
    timeline: 'Cronograma',
    automations: 'Automações de Fluxo',
    metrics: 'Métricas de Engenharia',
  };

  return (
    <header className="h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-4 z-20 select-none transition-colors">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] focus-visible:ring-2 focus-visible:ring-[#0066ff] transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentView('overview')}
          title="Ir para Visão Geral"
        >
          <div className="w-6 h-6 rounded-md bg-[#0066ff] flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">
            SoftFlow
          </span>
          <span className="text-[var(--text-muted)] text-xs hidden sm:inline" aria-hidden="true">/</span>
          <span className="text-xs text-[var(--text-secondary)] font-medium hidden sm:inline group-hover:text-[#0066ff] transition-colors">
            {viewLabels[currentView] || 'Visão Geral'}
          </span>
        </div>
      </div>

      {/* Zone 2: Universal Search Bar */}
      <div className="flex-1 max-w-md sm:max-w-lg">
        <div className="relative group">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[#0066ff] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar demandas, PRs, testes ou responsáveis..."
            className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs rounded-lg pl-9 pr-9 py-1.5 border border-[var(--border-subtle)] focus:outline-none focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs px-1 rounded"
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Actions, Integrations, Theme toggle & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 text-[var(--text-secondary)] shrink-0">
        <button
          type="button"
          onClick={() => setIsIntegrationsOpen(true)}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
          title="Status das Integrações Claude, Codex e GitHub"
        >
          <Zap className={`w-3.5 h-3.5 ${isGithubConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className="hidden sm:inline">Integrações</span>
          {isGithubConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden sm:inline" />
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[#0066ff]"
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          aria-label={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors hidden sm:inline-flex"
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors hidden md:inline-flex"
          title="Caixa de entrada"
          aria-label="Caixa de entrada"
        >
          <Inbox className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors hidden lg:inline-flex"
          title="Ajuda e documentação"
          aria-label="Ajuda e documentação"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div
          className="w-7 h-7 rounded-lg bg-[#0066ff] text-white font-semibold text-xs flex items-center justify-center border border-white/20 cursor-pointer shadow-xs"
          title="Lucas Martins (lucas.martins@preventsenior.com.br)"
        >
          LM
        </div>
      </div>
    </header>
  );
};
