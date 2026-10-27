import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  secondaryAction?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  secondaryAction,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 text-[var(--text-secondary)] shadow-xs">
        <Icon className="w-6 h-6 text-[var(--accent-primary)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryAction) && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
