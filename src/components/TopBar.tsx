import React from 'react';
import {
  Search,
  Bell,
  Inbox,
  UserPlus,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const TopBar: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsIntegrationsOpen } = useProject();

  return (
    <header className="h-11 border-b border-[#212633] bg-[#141720] flex items-center justify-between gap-8 px-4 z-10 select-none">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center space-x-2 shrink-0">
        <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
          SoftFlow
        </span>
        <span className="text-slate-500 text-xs" aria-hidden="true">/</span>
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          Engenharia &amp; Demandas
        </span>
      </div>

      {/* Zone 2: Universal Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por demandas, pull requests, testes ou responsáveis..."
            className="w-full bg-[#1b1f2b] text-slate-200 placeholder-slate-400 text-xs rounded-md pl-9 pr-4 py-1.5 border border-[#272e3d] focus:outline-none focus:border-[#0073ea] transition-all"
          />
        </div>
      </div>

      {/* Zone 3: 1 primary connection action & user profile */}
      <div className="flex items-center space-x-3 text-slate-400 shrink-0">
        <button
          onClick={() => setIsIntegrationsOpen(true)}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-[#1b1f2b] hover:bg-[#232938] border border-[#272e3d] transition-colors whitespace-nowrap cursor-pointer"
          title="Status das Integrações GitHub e IAs"
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>Integrações</span>
        </button>

        <button
          className="p-1 rounded hover:bg-[#202532] hover:text-white transition-colors"
          title="Notificações"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        <button
          className="p-1 rounded hover:bg-[#202532] hover:text-white transition-colors"
          title="Caixa de entrada"
        >
          <Inbox className="w-3.5 h-3.5" />
        </button>

        <button
          className="p-1 rounded hover:bg-[#202532] hover:text-white transition-colors"
          title="Ajuda e documentação"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* User Avatar */}
        <div
          className="w-6 h-6 rounded-full bg-[#0073ea] text-white font-bold text-[11px] flex items-center justify-center border border-white/10 cursor-pointer"
          title="Lucas Martins (lucas.martins@preventsenior.com.br)"
        >
          S
        </div>
      </div>
    </header>
  );
};
