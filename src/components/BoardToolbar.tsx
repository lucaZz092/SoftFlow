import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ChevronDown,
  Search,
  User,
  Filter,
  ArrowUpDown,
  EyeOff,
  Layers,
  GitPullRequest,
  CheckCircle2,
  X,
  Check,
} from 'lucide-react';
import { useProject, SortField, GroupByOption } from '../context/ProjectContext';
import { TEAM_MEMBERS } from '../data/mockData';
import { Button } from './ui/Button';

export const BoardToolbar: React.FC = () => {
  const {
    addTask,
    groups,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterAssigneeId,
    setFilterAssigneeId,
    simulateGitHubEvent,
    sortBy,
    setSortBy,
    hiddenColumns,
    toggleColumnVisibility,
    groupBy,
    setGroupBy,
  } = useProject();

  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showHideDropdown, setShowHideDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showSimulateDropdown, setShowSimulateDropdown] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowPersonDropdown(false);
        setShowFilterDropdown(false);
        setShowSortDropdown(false);
        setShowHideDropdown(false);
        setShowGroupDropdown(false);
        setShowSimulateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateTask = () => {
    const targetGroup = groups[0] || { id: 'group-marketing' };
    addTask(targetGroup.id, 'Nova Demanda');
  };

  const hasActiveFilters = Boolean(filterStatus || filterPriority || filterAssigneeId || searchQuery || sortBy);

  const clearFilters = () => {
    setFilterStatus(null);
    setFilterPriority(null);
    setFilterAssigneeId(null);
    setSearchQuery('');
    setSortBy(null);
  };

  const standardColumns = [
    { id: 'assignee', label: 'Responsável' },
    { id: 'status', label: 'Status' },
    { id: 'dueDate', label: 'Prazo' },
    { id: 'priority', label: 'Prioridade' },
    { id: 'timeline', label: 'Cronograma' },
    { id: 'integrations', label: 'Integrações (Git/IA)' },
  ];

  return (
    <div
      ref={toolbarRef}
      className="min-h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-xs select-none transition-colors py-1.5"
    >
      {/* Left controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Criar demanda */}
        <div className="flex items-center rounded-lg overflow-hidden shadow-xs border border-transparent">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateTask}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="rounded-r-none font-semibold"
          >
            Criar demanda
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateTask}
            className="rounded-l-none border-l border-white/20 px-2 min-h-[30px]"
            aria-label="Opções de criação"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nome..."
            className="bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] focus:bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder-[var(--text-muted)] pl-8 pr-6 py-1 rounded-lg border border-[var(--border-subtle)] focus:border-[#0066ff] outline-none transition-all w-28 sm:w-36 focus:w-48 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Pessoa filter */}
        <div className="relative">
          <Button
            variant={filterAssigneeId ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setShowPersonDropdown(!showPersonDropdown);
              setShowFilterDropdown(false);
              setShowSortDropdown(false);
              setShowHideDropdown(false);
              setShowGroupDropdown(false);
              setShowSimulateDropdown(false);
            }}
            leftIcon={<User className="w-3.5 h-3.5" />}
          >
            Pessoa
          </Button>

          {showPersonDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-1.5 z-30 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setFilterAssigneeId(null);
                  setShowPersonDropdown(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] cursor-pointer flex items-center justify-between text-left text-xs transition-colors"
              >
                <span>Todos os membros</span>
                {!filterAssigneeId && <CheckCircle2 className="w-3.5 h-3.5 text-[#0066ff]" />}
              </button>
              {TEAM_MEMBERS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setFilterAssigneeId(m.id);
                    setShowPersonDropdown(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] cursor-pointer flex items-center justify-between text-left text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </span>
                    <span className="truncate">{m.name}</span>
                  </div>
                  {filterAssigneeId === m.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#0066ff] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="relative">
          <Button
            variant={filterStatus || filterPriority ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setShowFilterDropdown(!showFilterDropdown);
              setShowPersonDropdown(false);
              setShowSortDropdown(false);
              setShowHideDropdown(false);
              setShowGroupDropdown(false);
              setShowSimulateDropdown(false);
            }}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
            rightIcon={<ChevronDown className="w-3 h-3" />}
          >
            Filtros
          </Button>

          {showFilterDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-60 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-3 z-30 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  Por Status
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {['Pronto', 'Em andamento', 'Parado', 'Em Revisão', 'Trabalhando nisso'].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => {
                        setFilterStatus(filterStatus === s ? null : s);
                        setShowFilterDropdown(false);
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] text-left transition-colors truncate cursor-pointer ${
                        filterStatus === s
                          ? 'bg-[#0066ff] text-white font-medium shadow-xs'
                          : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-2.5">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  Por Prioridade
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {['Crítica', 'Alta', 'Média', 'Baixa'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => {
                        setFilterPriority(filterPriority === p ? null : p);
                        setShowFilterDropdown(false);
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] text-left transition-colors truncate cursor-pointer ${
                        filterPriority === p
                          ? 'bg-[#0066ff] text-white font-medium shadow-xs'
                          : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ordenar */}
        <div className="relative">
          <Button
            variant={sortBy ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowPersonDropdown(false);
              setShowFilterDropdown(false);
              setShowHideDropdown(false);
              setShowGroupDropdown(false);
              setShowSimulateDropdown(false);
            }}
            leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
          >
            <span>Ordenar</span>
            {sortBy && <span className="font-mono text-[10px] ml-1">({sortBy.field})</span>}
          </Button>

          {showSortDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-1.5 z-30 space-y-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 block">
                Ordenar Demandas Por:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSortBy({ field: 'dueDate', direction: sortBy?.direction === 'asc' ? 'desc' : 'asc' });
                  setShowSortDropdown(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Prazo de Entrega</span>
                {sortBy?.field === 'dueDate' && <Check className="w-3.5 h-3.5 text-[#0066ff]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy({ field: 'priority', direction: 'desc' });
                  setShowSortDropdown(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Prioridade (Mais Crítica)</span>
                {sortBy?.field === 'priority' && <Check className="w-3.5 h-3.5 text-[#0066ff]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy({ field: 'title', direction: 'asc' });
                  setShowSortDropdown(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Título (A - Z)</span>
                {sortBy?.field === 'title' && <Check className="w-3.5 h-3.5 text-[#0066ff]" />}
              </button>

              {sortBy && (
                <button
                  type="button"
                  onClick={() => {
                    setSortBy(null);
                    setShowSortDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 text-xs border-t border-[var(--border-subtle)] mt-1 cursor-pointer transition-colors"
                >
                  Remover ordenação
                </button>
              )}
            </div>
          )}
        </div>

        {/* Ocultar Colunas */}
        <div className="relative">
          <Button
            variant={hiddenColumns.length > 0 ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setShowHideDropdown(!showHideDropdown);
              setShowPersonDropdown(false);
              setShowFilterDropdown(false);
              setShowSortDropdown(false);
              setShowGroupDropdown(false);
              setShowSimulateDropdown(false);
            }}
            leftIcon={<EyeOff className="w-3.5 h-3.5" />}
          >
            <span>Ocultar</span>
            {hiddenColumns.length > 0 && <span className="font-mono text-[10px] ml-1">({hiddenColumns.length})</span>}
          </Button>

          {showHideDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-1.5 z-30 space-y-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 block">
                Exibir / Ocultar Colunas:
              </span>
              {standardColumns.map((col) => {
                const isHidden = hiddenColumns.includes(col.id);
                return (
                  <button
                    type="button"
                    key={col.id}
                    onClick={() => toggleColumnVisibility(col.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-xs flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className={isHidden ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}>
                      {col.label}
                    </span>
                    {!isHidden && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Agrupar por */}
        <div className="relative">
          <Button
            variant={groupBy !== 'group' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setShowGroupDropdown(!showGroupDropdown);
              setShowPersonDropdown(false);
              setShowFilterDropdown(false);
              setShowSortDropdown(false);
              setShowHideDropdown(false);
              setShowSimulateDropdown(false);
            }}
            leftIcon={<Layers className="w-3.5 h-3.5" />}
          >
            Agrupar
          </Button>

          {showGroupDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-1.5 z-30 space-y-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 block">
                Agrupar Demanda Por:
              </span>
              <button
                type="button"
                onClick={() => {
                  setGroupBy('group');
                  setShowGroupDropdown(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Grupos de Trabalho (Padrão)</span>
                {groupBy === 'group' && <Check className="w-3.5 h-3.5 text-[#0066ff]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setGroupBy('status');
                  setShowGroupDropdown(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Por Status</span>
                {groupBy === 'status' && <Check className="w-3.5 h-3.5 text-[#0066ff]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setGroupBy('assignee');
                  setShowGroupDropdown(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Por Responsável</span>
                {groupBy === 'assignee' && <Check className="w-3.5 h-3.5 text-[#0066ff]" />}
              </button>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-rose-500 hover:text-rose-600 underline ml-1 cursor-pointer font-medium"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Right controls: Webhook Simulator button */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowSimulateDropdown(!showSimulateDropdown);
              setShowPersonDropdown(false);
              setShowFilterDropdown(false);
              setShowSortDropdown(false);
              setShowHideDropdown(false);
              setShowGroupDropdown(false);
            }}
            leftIcon={<GitPullRequest className="w-3.5 h-3.5 text-emerald-500" />}
            rightIcon={<ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
            title="Simular eventos em tempo real para disparar automações"
          >
            <span>Simular Webhook</span>
          </Button>

          {showSimulateDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-2 z-40 space-y-1.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 block">
                Disparo em Tempo Real:
              </span>
              <button
                type="button"
                onClick={() => {
                  simulateGitHubEvent('PR_MERGED');
                  setShowSimulateDropdown(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs flex items-start gap-2.5 transition-colors cursor-pointer border border-transparent hover:border-[var(--border-subtle)]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">GitHub: PR Merged</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Move tarefa para Concluído &amp; status Pronto</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  simulateGitHubEvent('PR_OPENED');
                  setShowSimulateDropdown(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs flex items-start gap-2.5 transition-colors cursor-pointer border border-transparent hover:border-[var(--border-subtle)]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">GitHub: Novo PR Aberto</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Move para "Em Revisão" &amp; aciona Codex</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
