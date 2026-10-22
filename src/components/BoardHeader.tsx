import React from 'react';
import { motion } from 'motion/react';
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
  Plus,
  Compass,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from '../types';
import { Button } from './ui/Button';

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
    { id: 'overview', label: 'Visão Geral', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'table', label: 'Quadro Principal', icon: <Table className="w-3.5 h-3.5" /> },
    { id: 'kanban', label: 'Kanban Ágil', icon: <Kanban className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Cronograma', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'automations', label: 'Automações de Fluxo', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'metrics', label: 'Painéis e Métricas', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] select-none pt-3 px-3 sm:px-5 transition-colors">
      {/* Top Row: Board Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        {/* Title dropdown */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight cursor-pointer hover:opacity-85 transition-opacity">
            <span className="truncate">SoftSolutions</span>
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <span className="text-[var(--text-muted)] text-xs hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-xs text-[var(--text-secondary)] font-medium hidden sm:inline truncate">
            Gestão de Demandas &amp; Engenharia
          </span>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Sugestão de IA */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAiModalOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#0066ff]" />}
            className="cursor-pointer"
          >
            <span className="hidden sm:inline">Sugestões de</span> IA
          </Button>

          {/* Integrar */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsIntegrationsOpen(true)}
            leftIcon={<Link2 className="w-3.5 h-3.5 text-emerald-500" />}
            title="GitHub, Claude, Codex"
          >
            Integrar
          </Button>

          {/* Automatizar */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentView('automations')}
            leftIcon={<Workflow className="w-3.5 h-3.5 text-amber-500" />}
            rightIcon={
              activeAutomationsCount > 0 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/10 text-[#0066ff] font-bold">
                  {activeAutomationsCount}
                </span>
              ) : undefined
            }
          >
            Automatizar
          </Button>

          {/* Agents */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsIntegrationsOpen(true)}
            leftIcon={<Bot className="w-3.5 h-3.5 text-indigo-500" />}
            className="hidden md:inline-flex"
          >
            Agentes
          </Button>

          {/* Convidar */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            className="hidden lg:inline-flex"
          >
            Convidar
          </Button>
        </div>
      </div>

      {/* Bottom Row: View Tabs with Linear-style Active Indicator */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-0.5 relative">
        {views.map((v) => {
          const isActive = currentView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setCurrentView(v.id)}
              className={`relative flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 rounded-t-md ${
                isActive
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <span className={isActive ? 'text-[#0066ff]' : 'text-current opacity-70'}>
                {v.icon}
              </span>
              <span>{v.label}</span>

              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0066ff]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setIsNewAutomationOpen(true)}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-md transition-colors cursor-pointer ml-1"
          title="Nova automação"
          aria-label="Criar nova automação"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
