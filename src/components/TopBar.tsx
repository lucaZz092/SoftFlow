import React from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const VIEW_LABELS: Record<string, string> = {
  overview: 'Início',
  table: 'Demandas',
  kanban: 'Kanban',
  timeline: 'Cronograma',
  automations: 'Automações',
  metrics: 'Métricas',
};

export const TopBar: React.FC = () => {
  const { currentView, isMobileSidebarOpen, setIsMobileSidebarOpen, setIsAiModalOpen } = useProject();

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden -ml-1 p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-medium text-[var(--text-primary)] truncate">
          {VIEW_LABELS[currentView] || 'Início'}
        </h1>
      </div>

      <button
        type="button"
        onClick={() => setIsAiModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Sugestões de IA</span>
      </button>
    </header>
  );
};
