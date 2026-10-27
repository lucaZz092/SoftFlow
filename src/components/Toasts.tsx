import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Workflow, Info } from 'lucide-react';
import { useProject, ToastMessage } from '../context/ProjectContext';

export const Toasts: React.FC = () => {
  const { toasts, dismissToast } = useProject();

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'automation':
        return <Workflow className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-[var(--accent-primary)]" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none select-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className="pointer-events-auto p-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl flex items-start justify-between gap-3 backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shrink-0 shadow-xs">
                {getIcon(toast.type)}
              </div>
              <div className="min-w-0 pr-2">
                <div className="font-semibold text-xs text-[var(--text-primary)]">{toast.title}</div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">{toast.description}</p>
                {toast.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action!.onClick();
                      dismissToast(toast.id);
                    }}
                    className="mt-1.5 text-xs font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums mt-1 block">
                    {toast.timestamp}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md hover:bg-[var(--bg-surface-hover)] transition-colors shrink-0 cursor-pointer"
              aria-label="Dispensar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
