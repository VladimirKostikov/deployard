import { useTranslation } from 'react-i18next';
import type { DeploymentSummary } from '@dpd/shared';
import { Card } from '../../components/ui/Card';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { isDeploymentRolloutInProgress } from './deployment-rollout';

interface DeploymentRolloutBannerProps {
  deployment: DeploymentSummary;
  restartPending: boolean;
}

export function DeploymentRolloutBanner({
  deployment,
  restartPending,
}: DeploymentRolloutBannerProps) {
  const { t } = useTranslation('deployments');
  const rolloutActive = restartPending || isDeploymentRolloutInProgress(deployment);

  if (!rolloutActive) {
    return null;
  }

  return (
    <Card className="border border-border p-4">
      <div className="space-y-2 text-sm">
        <StatusIndicator variant="idle" pulse>
          {t('restart.bannerTitle')}
        </StatusIndicator>
        <p className="pl-4 text-secondary">
          {t('restart.bannerProgress', {
            ready: deployment.readyReplicas,
            desired: deployment.replicas,
            updated: deployment.updatedReplicas,
          })}
        </p>
        <p className="pl-4 text-xs text-secondary">{t('restart.bannerHint')}</p>
      </div>
    </Card>
  );
}
