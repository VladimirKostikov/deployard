import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">{title}</h1>
        <p className="text-sm text-secondary">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
