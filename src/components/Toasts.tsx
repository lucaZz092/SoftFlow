import React from 'react';
import { X, Workflow, GitBranch, Bot, Zap, Info } from 'lucide-react';
import { useProject, ToastMessage } from '../context/ProjectContext';

export const Toasts: React.FC = () => {
  const { toasts, dismissToast } = useProject();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'github':
        return <GitBranch className="w-3.5 h-3.5 text-purple-400" />;
      case 'claude':
        return <Bot className="w-3.5 h-3.5 text-indigo-400" />;
      case 'codex':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'automation':
        return <Workflow className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getBorderColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'github':
        return 'border-purple-500/30 bg-[#191624]';
      case 'claude':
        return 'border-indigo-500/30 bg-[#161725]';
      case 'codex':
        return 'border-amber-500/30 bg-[#211b15]';
      case 'automation':
        return 'border-emerald-500/30 bg-[#14201b]';
      default:
        return 'border-[#282e3b] bg-[#161922]';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3 rounded-lg border shadow-xl flex items-start justify-between gap-3 transition-all ${getBorderColor(
            toast.type
          )}`}
        >
          <div className="flex items-start space-x-2.5">
            <div className="p-1 rounded bg-[#13151c] mt-0.5 shrink-0 border border-white/5">
              {getIcon(toast.type)}
            </div>
            <div>
              <div className="font-semibold text-white text-xs">{toast.title}</div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.description}</p>
              <span className="text-[9px] text-slate-500 font-mono tabular-nums mt-1 block">{toast.timestamp}</span>
            </div>
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
