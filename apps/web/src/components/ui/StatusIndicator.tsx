import type { ReactNode } from 'react';

export type StatusVariant = 'ok' | 'warn' | 'idle' | 'off' | 'error';

interface StatusIndicatorProps {
  variant: StatusVariant;
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}

const dotClasses: Record<StatusVariant, string> = {
  ok: 'bg-status-ok',
  warn: 'bg-status-warn',
  idle: 'bg-status-idle',
  off: 'bg-status-off',
  error: 'bg-status-error',
};

export function StatusIndicator({
  variant,
  children,
  pulse = false,
  className = '',
}: StatusIndicatorProps) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm text-primary ${className}`}>
      <span
        className={`inline-block h-2 w-2 shrink-0 ${dotClasses[variant]} ${
          pulse ? 'animate-pulse' : ''
        }`}
        aria-hidden
      />
      <span className="inline-flex items-center gap-1.5">{children}</span>
    </span>
  );
}
