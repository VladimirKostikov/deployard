import { useTranslation } from 'react-i18next';
import { ALL_NAMESPACES } from '@dpd/shared';
import { useDeployments } from '../../hooks/kubernetes';
import { Card } from '../../components/ui/Card';
import { DeploymentGroupedTable } from './DeploymentGroupedTable';

interface DeploymentListProps {
  namespace: string;
}

export function DeploymentList({ namespace }: DeploymentListProps) {
  const { t } = useTranslation('deployments');
  const { data, isLoading, isError } = useDeployments(namespace);

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('loading')}</p>;
  }

  if (isError) {
    return (
      <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">
        {t('error')}
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className="p-8 text-center text-sm text-secondary">
        {namespace === ALL_NAMESPACES ? t('emptyAll') : t('empty')}
      </Card>
    );
  }

  return <DeploymentGroupedTable namespace={namespace} deployments={data} />;
}
