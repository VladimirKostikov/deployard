import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex border border-border px-2 py-0.5 text-xs text-secondary">
      {children}
    </span>
  );
}
