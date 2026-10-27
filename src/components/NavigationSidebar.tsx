import React from 'react';
import {
  Compass,
  LayoutList,
  Layers,
  Calendar,
  Workflow,
  BarChart3,
  Plug,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from '../types';

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Início', icon: Compass },
  { id: 'table', label: 'Demandas', icon: LayoutList },
  { id: 'kanban', label: 'Kanban', icon: Layers },
  { id: 'timeline', label: 'Cronograma', icon: Calendar },
  { id: 'automations', label: 'Automações', icon: Workflow },
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
];

export const NavigationSidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setIsIntegrationsOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    theme,
    toggleTheme,
  } = useProject();

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    setIsMobileSidebarOpen(false);
  };

  const itemClass = (active: boolean) =>
    `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-left transition-colors cursor-pointer ${
      active
        ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-medium'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
    }`;

  const sidebarContent = (
    <div className="w-56 h-full flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] select-none">
      {/* Brand */}
      <div className="h-14 px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="w-6 h-6 rounded-md bg-[var(--text-primary)] text-[var(--bg-canvas)] flex items-center justify-center text-[11px] font-semibold">
            S
          </span>
          <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">SoftFlow</span>
        </button>
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Fechar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleNavClick(id)}
            className={itemClass(currentView === id)}
            aria-current={currentView === id ? 'page' : undefined}
          >
            <Icon className="w-4 h-4 shrink-0 opacity-80" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-[var(--border-subtle)] space-y-0.5">
        <button
          type="button"
          onClick={() => {
            setIsIntegrationsOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          className={itemClass(false)}
        >
          <Plug className="w-4 h-4 shrink-0 opacity-80" />
          <span>Integrações</span>
        </button>
        <button type="button" onClick={toggleTheme} className={itemClass(false)}>
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 shrink-0 opacity-80" />
          ) : (
            <Moon className="w-4 h-4 shrink-0 opacity-80" />
          )}
          <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
        </button>
        <div className="flex items-center gap-2.5 px-2.5 pt-3">
          <span className="w-6 h-6 rounded-full bg-[var(--bg-surface-active)] text-[var(--text-secondary)] text-[10px] font-semibold flex items-center justify-center">
            LM
          </span>
          <span className="text-[13px] text-[var(--text-secondary)] truncate">Lucas Martins</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex h-screen z-20 shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 transition-opacity"
          />
          <div className="relative z-10 flex h-full shadow-2xl">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
