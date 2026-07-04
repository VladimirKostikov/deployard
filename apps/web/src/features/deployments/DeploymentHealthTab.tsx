import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { DeploymentHealthProbes } from './DeploymentHealthProbes';

interface DeploymentHealthTabProps {
  namespace: string;
  name: string;
}

export function DeploymentHealthTab({ namespace, name }: DeploymentHealthTabProps) {
  const { t } = useTranslation('deployments');

  return (
    <Card className="p-5">
      <p className="mb-4 font-medium text-primary">{t('healthProbes.title')}</p>
      <DeploymentHealthProbes namespace={namespace} deploymentName={name} />
    </Card>
  );
}
