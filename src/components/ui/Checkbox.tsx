import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Text next to the box; when set, the whole label is clickable */
  label?: React.ReactNode;
  size?: 'sm' | 'md';
}

/**
 * Animated checkbox: the box outline opens and the check mark draws in when checked.
 * The native input stays in the DOM (invisible, covering the box) for keyboard, focus and forms,
 * so it also works inside an existing <label>.
 */
export const Checkbox: React.FC<CheckboxProps> = ({ label, size = 'md', className = '', ...inputProps }) => {
  const box = (
    <span className={`sf-checkbox sf-checkbox--${size} ${label ? '' : className}`}>
      <input type="checkbox" {...inputProps} />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1.5" y="1.5" width={21} height={21} rx={5} ry={5} strokeWidth={3} />
          <polyline points="7 10 12 16 22 2" strokeWidth={4} />
        </g>
      </svg>
    </span>
  );

  if (!label) return box;

  return (
    <label className={`sf-checkbox-label ${className}`}>
      {box}
      <span>{label}</span>
    </label>
  );
};
