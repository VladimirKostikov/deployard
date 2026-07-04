import type { MetricsMethodStat, MetricsStatusStat } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { statusVariant } from './metrics-format';

interface MetricsHttpBreakdownProps {
  byStatus: MetricsStatusStat[];
  byMethod: MetricsMethodStat[];
}

export function MetricsHttpBreakdown({ byStatus, byMethod }: MetricsHttpBreakdownProps) {
  const { t } = useTranslation('metrics');

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BreakdownList
        title={t('sections.byStatus')}
        emptyLabel={t('empty')}
        items={byStatus.map((entry) => ({
          key: entry.status,
          label: entry.status,
          value: entry.total,
          variant: statusVariant(entry.status),
        }))}
      />
      <BreakdownList
        title={t('sections.byMethod')}
        emptyLabel={t('empty')}
        items={byMethod.map((entry) => ({
          key: entry.method,
          label: entry.method,
          value: entry.total,
          variant: 'idle' as const,
        }))}
      />
    </div>
  );
}

interface BreakdownItem {
  key: string;
  label: string;
  value: number;
  variant: 'ok' | 'warn' | 'error' | 'idle';
}

function BreakdownList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: BreakdownItem[];
  emptyLabel: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="mb-4 font-medium text-primary">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-secondary">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <StatusIndicator variant={item.variant} className="min-w-0 truncate">
                  <span className="truncate">{item.label}</span>
                </StatusIndicator>
                <span className="shrink-0 text-primary">{item.value}</span>
              </div>
              <div className="h-2 bg-canvas">
                <div
                  className="h-2 bg-accent"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
