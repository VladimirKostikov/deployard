import { useTranslation } from 'react-i18next';
import { OpenIcon } from '../../components/icons/DeploymentActionIcons';
import type { DeploymentSummary } from '@dpd/shared';
import { DeploymentActionLink } from './DeploymentActionLink';
import { DeploymentManageActions } from './DeploymentManageActions';

interface DeploymentTableActionsProps {
  namespace: string;
  name: string;
  deployment?: DeploymentSummary;
}

export function DeploymentTableActions({ namespace, name, deployment }: DeploymentTableActionsProps) {
  const { t } = useTranslation('deployments');
  const basePath = `/deployments/${name}`;

  return (
    <div className="flex flex-nowrap items-center gap-2">
      <DeploymentActionLink
        to={basePath}
        label={t('actions.view')}
        testId={`deployment-link-${name}`}
        tone="accent"
        icon={<OpenIcon />}
      />
      <DeploymentManageActions namespace={namespace} name={name} deployment={deployment} />
    </div>
  );
}
