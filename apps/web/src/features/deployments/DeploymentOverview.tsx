import { useTranslation } from 'react-i18next';
import type { DeploymentSummary } from '@dpd/shared';
import { DeploymentStatusDialog } from './DeploymentStatusDialog';

interface DeploymentOverviewProps {
  name: string;
  namespace: string;
  deployment: DeploymentSummary;
}

export function DeploymentOverview({ name, namespace, deployment }: DeploymentOverviewProps) {
  const { t } = useTranslation('deployments');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{name}</h1>
        <DeploymentStatusDialog deployment={deployment} />
      </div>
      <p className="text-sm text-secondary">{t('detail.subtitle', { namespace })}</p>
      <p className="text-sm text-secondary">{deployment.image}</p>
    </div>
  );
}
