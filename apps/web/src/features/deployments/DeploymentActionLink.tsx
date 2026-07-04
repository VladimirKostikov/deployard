import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HoverTooltip } from '../../components/ui/HoverTooltip';

interface DeploymentActionLinkProps {
  to: string;
  label: string;
  icon: ReactNode;
  testId?: string;
  tone?: 'default' | 'accent' | 'warning';
}

const toneClasses = {
  default:
    'text-secondary hover:border-secondary hover:bg-canvas hover:text-primary focus-visible:ring-2 focus-visible:ring-accent/30',
  accent:
    'text-accent hover:border-accent/40 hover:bg-accent-soft/40 focus-visible:ring-2 focus-visible:ring-accent/30',
  warning:
    'text-warning hover:border-warning/40 hover:bg-warning-soft/40 focus-visible:ring-2 focus-visible:ring-warning/30',
};

export function DeploymentActionLink({
  to,
  label,
  icon,
  testId,
  tone = 'default',
}: DeploymentActionLinkProps) {
  return (
    <HoverTooltip label={label}>
      <Link
        to={to}
        aria-label={label}
        data-testid={testId}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-apple border border-border bg-elevated transition-all hover:shadow-sm ${toneClasses[tone]}`}
      >
        {icon}
      </Link>
    </HoverTooltip>
  );
}
