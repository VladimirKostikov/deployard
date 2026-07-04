import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDeploymentServices } from '../../hooks/kubernetes/useNetwork';
import { Card } from '../../components/ui/Card';
import { DeploymentServiceList } from './ServiceTable';

interface DeploymentNetworkSectionProps {
  namespace: string;
  deploymentName: string;
}

export function DeploymentNetworkSection({ namespace, deploymentName }: DeploymentNetworkSectionProps) {
  const { t } = useTranslation('network');
  const { data, isLoading, isError } = useDeploymentServices(namespace, deploymentName);

  return (
    <Card className="space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-primary">{t('deployment.title')}</h2>
        <Link to="/network?tab=services" className="text-xs text-accent underline-offset-2 hover:underline">
          {t('deployment.openNetwork')}
        </Link>
      </div>

      {isLoading && <p className="text-sm text-secondary">{t('deployment.loading')}</p>}
      {isError && <p className="text-sm text-danger">{t('deployment.error')}</p>}
      {!isLoading && !isError && <DeploymentServiceList services={data ?? []} />}
    </Card>
  );
}
