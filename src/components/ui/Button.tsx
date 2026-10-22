import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-canvas)]';

    const sizeStyles = {
      xs: 'text-xs px-2 py-1 gap-1.5 rounded-md min-h-[26px]',
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-md min-h-[30px]',
      md: 'text-sm px-3.5 py-1.5 gap-2 rounded-lg min-h-[34px]',
      lg: 'text-sm px-4 py-2 gap-2.5 rounded-lg min-h-[40px]',
      icon: 'p-1.5 rounded-md aspect-square justify-center',
    }[size];

    const variantStyles = {
      primary:
        'bg-[#0066ff] hover:bg-[#0052cc] active:bg-[#0047b3] text-white shadow-sm font-semibold border border-transparent shadow-[#0066ff]/20',
      secondary:
        'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] active:bg-[var(--bg-surface-active)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs',
      ghost:
        'bg-transparent hover:bg-[var(--bg-surface-hover)] active:bg-[var(--bg-surface-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent',
      danger:
        'bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/25 text-red-500 dark:text-red-400 border border-red-500/30',
      outline:
        'bg-transparent hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)]',
      subtle:
        'bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
