import { useTranslation } from 'react-i18next';
import { MetricsDashboardPanel } from '../features/metrics/MetricsDashboardPanel';

export function MetricsPage() {
  const { t } = useTranslation('metrics');

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{t('title')}</h1>
      </div>
      <MetricsDashboardPanel />
    </div>
  );
}
