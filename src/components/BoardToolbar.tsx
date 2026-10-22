import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { TEAM_MEMBERS } from '../data/mockData';

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
  } = useProject();

  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSimulateDropdown, setShowSimulateDropdown] = useState(false);

  const handleCreateTask = () => {
    const targetGroup = groups[0] || { id: 'group-marketing' };
    addTask(targetGroup.id, 'Nova Tarefa');
  };

  const hasActiveFilters = Boolean(filterStatus || filterPriority || filterAssigneeId || searchQuery);

  const clearFilters = () => {
    setFilterStatus(null);
    setFilterPriority(null);
    setFilterAssigneeId(null);
    setSearchQuery('');
  };

  return (
    <div className="h-11 border-b border-[#212633] bg-[#141720] px-5 flex items-center justify-between text-xs select-none">
      {/* Left controls */}
      <div className="flex items-center space-x-2">
        {/* Criar tarefa */}
        <div className="flex items-center rounded overflow-hidden shadow-xs">
          <button
            onClick={handleCreateTask}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0073ea] hover:bg-[#0062c7] text-white font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar tarefa</span>
          </button>
          <button
            onClick={handleCreateTask}
            className="px-1.5 py-1.5 bg-[#0062c7] hover:bg-[#0052a6] text-white transition-colors cursor-pointer border-l border-white/20"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="bg-[#1b1f2b] hover:bg-[#202533] focus:bg-[#202533] text-slate-200 placeholder-slate-400 pl-8 pr-6 py-1 rounded border border-[#272e3d] focus:border-[#0073ea] outline-none transition-all w-32 focus:w-48 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Pessoa filter */}
        <div className="relative">
          <button
            onClick={() => setShowPersonDropdown(!showPersonDropdown)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded hover:bg-[#1f2430] text-slate-300 transition-colors border ${
              filterAssigneeId ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Pessoa</span>
          </button>

          {showPersonDropdown && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-[#1b1f2b] border border-[#2b3243] rounded-md shadow-xl p-1 z-30">
              <button
                onClick={() => {
                  setFilterAssigneeId(null);
                  setShowPersonDropdown(false);
                }}
                className="w-full px-2.5 py-1.5 rounded hover:bg-[#242b3a] text-slate-300 cursor-pointer flex items-center justify-between text-left text-xs"
              >
                <span>Todos os membros</span>
                {!filterAssigneeId && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
              </button>
              {TEAM_MEMBERS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setFilterAssigneeId(m.id);
                    setShowPersonDropdown(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded hover:bg-[#242b3a] text-slate-300 cursor-pointer flex items-center justify-between text-left text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </span>
                    <span className="truncate">{m.name}</span>
                  </div>
                  {filterAssigneeId === m.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtro */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded hover:bg-[#1f2430] text-slate-300 transition-colors border ${
              filterStatus || filterPriority ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'border-transparent'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtros</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showFilterDropdown && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#1b1f2b] border border-[#2b3243] rounded-md shadow-xl p-2.5 z-30 space-y-2.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Status
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {['Pronto', 'Em andamento', 'Parado', 'Em Revisão'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFilterStatus(filterStatus === s ? null : s);
                        setShowFilterDropdown(false);
                      }}
                      className={`px-2 py-1 rounded text-[11px] text-left transition-colors truncate cursor-pointer ${
                        filterStatus === s ? 'bg-[#0073ea] text-white font-medium' : 'hover:bg-[#242b3a] text-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#262c3b] pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Prioridade
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {['Crítica', 'Alta', 'Média', 'Baixa'].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setFilterPriority(filterPriority === p ? null : p);
                        setShowFilterDropdown(false);
                      }}
                      className={`px-2 py-1 rounded text-[11px] text-left transition-colors truncate cursor-pointer ${
                        filterPriority === p ? 'bg-[#0073ea] text-white font-medium' : 'hover:bg-[#242b3a] text-slate-300'
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
        <button className="flex items-center space-x-1.5 px-2.5 py-1 rounded hover:bg-[#1f2430] text-slate-300 transition-colors">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Ordenar</span>
        </button>

        {/* Ocultar */}
        <button className="flex items-center space-x-1.5 px-2.5 py-1 rounded hover:bg-[#1f2430] text-slate-300 transition-colors">
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          <span>Ocultar</span>
        </button>

        {/* Agrupar */}
        <button className="flex items-center space-x-1.5 px-2.5 py-1 rounded hover:bg-[#1f2430] text-slate-300 transition-colors">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Agrupar</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[11px] text-rose-400 hover:text-rose-300 underline ml-2 cursor-pointer font-medium"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Right controls: Webhook Simulator button */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setShowSimulateDropdown(!showSimulateDropdown)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1b1f2b] hover:bg-[#232938] border border-[#272e3d] text-emerald-400 font-medium transition-colors cursor-pointer"
            title="Simular eventos em tempo real para disparar automações"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span className="text-[11px]">Simular Webhook</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showSimulateDropdown && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-[#1b1f2b] border border-[#2b3243] rounded-md shadow-2xl p-1.5 z-40 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Disparo de Automação:
              </span>
              <button
                onClick={() => {
                  simulateGitHubEvent('PR_MERGED');
                  setShowSimulateDropdown(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded hover:bg-[#242b3a] text-slate-200 text-xs flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <div>
                  <div className="font-semibold text-white">GitHub: PR #42 Merged</div>
                  <div className="text-[10px] text-slate-400">Move tarefa para Concluído &amp; status Pronto</div>
                </div>
              </button>
              <button
                onClick={() => {
                  simulateGitHubEvent('PR_OPENED');
                  setShowSimulateDropdown(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded hover:bg-[#242b3a] text-slate-200 text-xs flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-white">GitHub: Novo PR Aberto</div>
                  <div className="text-[10px] text-slate-400">Move para "Em Revisão" &amp; aciona Codex</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
