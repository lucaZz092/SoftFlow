import React from 'react';
import { TaskPriority, TaskStatus } from '../../types';
import { STATUS_STYLES, PRIORITY_STYLES } from '../../styles/designSystem';

export type BadgeVariant = 'default' | 'neutral' | 'blue' | 'purple' | 'green';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  status?: TaskStatus;
  priority?: TaskPriority;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const sizeClasses = {
    xs: 'text-[11px] px-1.5 py-0.5 rounded gap-1 font-medium',
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 rounded-md gap-1.5 font-semibold',
  }[size];

  if (status) {
    const config = STATUS_STYLES[status] || STATUS_STYLES['Novo'];
    return (
      <span
        className={`inline-flex items-center border transition-colors ${sizeClasses} ${config.bg} ${config.text} ${config.border} ${className}`}
      >
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
        <span>{children || config.label}</span>
      </span>
    );
  }

  if (priority) {
    const config = PRIORITY_STYLES[priority] || PRIORITY_STYLES['Média'];
    return (
      <span
        className={`inline-flex items-center border transition-colors ${sizeClasses} ${config.bg} ${config.text} ${config.border} ${className}`}
      >
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
        <span>{children || config.label}</span>
      </span>
    );
  }

  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    neutral: 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border-[var(--border-subtle)]',
    blue: 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/30 dark:text-[var(--accent-primary)]',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  };

  return (
    <span
      className={`inline-flex items-center border transition-colors ${sizeClasses} ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      <span>{children}</span>
    </span>
  );
};
