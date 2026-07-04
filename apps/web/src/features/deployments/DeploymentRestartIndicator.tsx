import { useTranslation } from 'react-i18next';
import type { DeploymentSummary } from '@dpd/shared';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { isDeploymentRolloutInProgress } from './deployment-rollout';

interface DeploymentRestartIndicatorProps {
  deployment: DeploymentSummary;
  restartPending: boolean;
}

export function DeploymentRestartIndicator({
  deployment,
  restartPending,
}: DeploymentRestartIndicatorProps) {
  const { t } = useTranslation('deployments');

  if (!restartPending && !isDeploymentRolloutInProgress(deployment)) {
    return null;
  }

  return (
    <StatusIndicator variant="warn" pulse className="text-xs font-medium">
      {t('status.restarting')}
    </StatusIndicator>
  );
}
