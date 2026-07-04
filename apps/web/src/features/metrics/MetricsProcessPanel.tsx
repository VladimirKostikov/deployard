import type { MetricsProcessSummary } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { formatCpuSeconds, formatDuration, formatMemory, formatMilliseconds } from './metrics-format';

interface MetricsProcessPanelProps {
  process: MetricsProcessSummary;
}

export function MetricsProcessPanel({ process }: MetricsProcessPanelProps) {
  const { t } = useTranslation('metrics');
  const heapRatio =
    process.memoryHeapTotalBytes > 0
      ? process.memoryHeapUsedBytes / process.memoryHeapTotalBytes
      : 0;

  const rows = [
    {
      label: t('process.rss'),
      value: formatMemory(process.memoryRssBytes),
      ratio: null,
    },
    {
      label: t('process.heap'),
      value: `${formatMemory(process.memoryHeapUsedBytes)} / ${formatMemory(process.memoryHeapTotalBytes)}`,
      ratio: heapRatio,
    },
    {
      label: t('process.cpuUser'),
      value: formatCpuSeconds(process.cpuUserSeconds),
      ratio: null,
    },
    {
      label: t('process.cpuSystem'),
      value: formatCpuSeconds(process.cpuSystemSeconds),
      ratio: null,
    },
    {
      label: t('process.eventLoopLag'),
      value: formatMilliseconds(process.eventLoopLagSeconds),
      ratio: null,
    },
    {
      label: t('process.uptime'),
      value: formatDuration(process.uptimeSeconds, {
        seconds: t('units.seconds'),
        minutes: t('units.minutes'),
        hours: t('units.hours'),
      }),
      ratio: null,
    },
  ];

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-medium text-primary">{t('sections.process')}</h2>
        <p className="mt-1 text-xs text-secondary">{t('process.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="space-y-2 border border-border bg-canvas p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-secondary">{row.label}</p>
              <p className="text-right text-sm font-medium text-primary">{row.value}</p>
            </div>
            {row.ratio !== null ? (
              <div className="h-2 bg-elevated">
                <div
                  className="h-2 bg-accent"
                  style={{ width: `${Math.min(100, row.ratio * 100)}%` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
