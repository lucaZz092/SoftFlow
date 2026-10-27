import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-label={title}
        className={`relative w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--border-subtle)] shrink-0">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border-subtle)] shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
};

export const fieldClass =
  'w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-2.5 py-1.5 rounded-md border border-[var(--border-subtle)] text-[13px] outline-none focus:border-[var(--accent-primary)]';

export const FormField: React.FC<{ label: string; htmlFor?: string; children: React.ReactNode; hint?: string }> = ({
  label,
  htmlFor,
  children,
  hint,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="block text-xs text-[var(--text-muted)]">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
  </div>
);
