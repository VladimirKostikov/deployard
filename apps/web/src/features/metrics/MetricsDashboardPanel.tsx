import { useTranslation } from 'react-i18next';
import type { MetricsDashboardSummary } from '@dpd/shared';
import { Card } from '../../components/ui/Card';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { useMetricsDashboard } from '../../hooks/kubernetes/useMetricsDashboard';
import { MetricsHttpBreakdown } from './MetricsHttpBreakdown';
import { MetricsLatencyPanel } from './MetricsLatencyPanel';
import { MetricsProcessPanel } from './MetricsProcessPanel';
import { MetricsRouteTable } from './MetricsRouteTable';
import { MetricsSummaryCards } from './MetricsSummaryCards';
import { formatPercent } from './metrics-format';

export function MetricsDashboardPanel() {
  const { t } = useTranslation('metrics');
  const { data, isLoading, isError } = useMetricsDashboard();

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('loading')}</p>;
  }

  if (isError || !data) {
    return (
      <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">
        {t('error')}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <MetricsHeader data={data} />
      <MetricsSummaryCards data={data} />
      <div className="grid gap-4 xl:grid-cols-2">
        <MetricsLatencyPanel latency={data.httpLatency} />
        <MetricsProcessPanel process={data.process} />
      </div>
      <MetricsHttpBreakdown
        byStatus={data.httpRequestsByStatus}
        byMethod={data.httpRequestsByMethod}
      />
      <MetricsRouteTable routes={data.httpRouteDetails} />
    </div>
  );
}

function MetricsHeader({ data }: { data: MetricsDashboardSummary }) {
  const { t } = useTranslation('metrics');
  const healthVariant =
    data.httpErrorRate >= 0.05 ? 'error' : data.httpErrorRate > 0 ? 'warn' : 'ok';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-canvas px-4 py-3">
      <StatusIndicator variant={healthVariant}>
        <span className="text-sm text-primary">
          {data.httpErrorCount > 0
            ? t('header.errors', {
                count: data.httpErrorCount,
                rate: formatPercent(data.httpErrorRate),
              })
            : t('header.healthy')}
        </span>
      </StatusIndicator>
      <p className="text-xs text-secondary">
        {t('updatedAt', { time: new Date(data.collectedAt).toLocaleTimeString() })}
      </p>
    </div>
  );
}
