import type { MetricsLatencySummary } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { formatMilliseconds } from './metrics-format';

interface MetricsLatencyPanelProps {
  latency: MetricsLatencySummary;
}

export function MetricsLatencyPanel({ latency }: MetricsLatencyPanelProps) {
  const { t } = useTranslation('metrics');
  const reference = Math.max(latency.p99Seconds, latency.avgSeconds, 0.001);

  const rows = [
    { key: 'p50', label: t('latency.p50'), value: latency.p50Seconds },
    { key: 'p95', label: t('latency.p95'), value: latency.p95Seconds },
    { key: 'p99', label: t('latency.p99'), value: latency.p99Seconds },
    { key: 'avg', label: t('latency.avg'), value: latency.avgSeconds },
  ];

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-medium text-primary">{t('sections.latency')}</h2>
          <p className="mt-1 text-xs text-secondary">{t('latency.subtitle')}</p>
        </div>
        <p className="text-xs text-secondary">
          {t('latency.samples', { count: latency.sampleCount })}
        </p>
      </div>

      {latency.sampleCount === 0 ? (
        <p className="text-sm text-secondary">{t('empty')}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.key}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-primary">{row.label}</span>
                <span className="text-secondary">{formatMilliseconds(row.value)}</span>
              </div>
              <div className="h-2 bg-canvas">
                <div
                  className="h-2 bg-accent"
                  style={{ width: `${Math.min(100, (row.value / reference) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
