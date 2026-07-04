import type { MetricsDashboardSummary } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import {
  formatDuration,
  formatMemory,
  formatMilliseconds,
  formatPercent,
  formatRate,
} from './metrics-format';

interface MetricsSummaryCardsProps {
  data: MetricsDashboardSummary;
}

export function MetricsSummaryCards({ data }: MetricsSummaryCardsProps) {
  const { t } = useTranslation('metrics');

  const cards = [
    {
      label: t('cards.requests'),
      value: String(data.httpRequestsTotal),
      hint: t('cards.requestsHint'),
    },
    {
      label: t('cards.throughput'),
      value: `${formatRate(data.httpRequestsPerSecond)} ${t('units.perSecond')}`,
      hint: t('cards.throughputHint'),
    },
    {
      label: t('cards.errorRate'),
      value: formatPercent(data.httpErrorRate),
      hint: t('cards.errorRateHint', { count: data.httpErrorCount }),
    },
    {
      label: t('cards.p95'),
      value: formatMilliseconds(data.httpLatency.p95Seconds),
      hint: t('cards.p95Hint'),
    },
    {
      label: t('cards.memory'),
      value: formatMemory(data.process.memoryRssBytes),
      hint: t('cards.memoryHint'),
    },
    {
      label: t('cards.uptime'),
      value: formatDuration(data.process.uptimeSeconds, {
        seconds: t('units.seconds'),
        minutes: t('units.minutes'),
        hours: t('units.hours'),
      }),
      hint: t('cards.uptimeHint'),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <p className="text-xs font-medium text-secondary">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{card.value}</p>
          <p className="mt-2 text-xs text-secondary">{card.hint}</p>
        </Card>
      ))}
    </div>
  );
}
