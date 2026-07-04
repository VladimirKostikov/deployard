import type { ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from '../icons/ThemeIcons';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ children, className = '', ...props }: SelectProps) {
  return (
    <div className={`relative ${className.includes('w-full') ? 'w-full' : 'inline-flex min-w-[8rem]'}`}>
      <select
        className={`select-control field-control h-9 w-full rounded-apple border border-border bg-elevated py-0 pl-3 pr-8 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
    </div>
  );
}

interface SelectorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function SelectorField({
  label,
  value,
  onChange,
  children,
  ariaLabel,
  className = '',
}: SelectorFieldProps) {
  return (
    <label
      className={`selector-field inline-flex w-full min-w-0 items-center gap-2 rounded-apple border border-border bg-elevated px-3 py-1.5 shadow-sm transition-colors hover:bg-canvas sm:w-auto sm:min-w-[10rem] ${className}`}
    >
      <span className="shrink-0 text-xs font-medium text-secondary">{label}</span>
      <div className="relative min-w-0 flex-1">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={ariaLabel ?? label}
          className="select-native w-full bg-transparent py-0.5 pr-6 text-sm font-medium text-primary outline-none"
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
      </div>
    </label>
  );
}
