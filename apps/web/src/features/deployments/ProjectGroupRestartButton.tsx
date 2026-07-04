import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AppSection } from '@dpd/shared';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { RestartIcon } from '../../components/icons/DeploymentActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { useAppMutation } from '../../hooks/use-app-mutation';
import {
  clearDeploymentsRestarting,
  markDeploymentsRestarting,
  useDeploymentRestartStore,
} from './deployment-restart-store';
import { deploymentIconButtonClass } from './deployment-icon-button';

interface ProjectGroupRestartButtonProps {
  namespace: string;
  partOf: string;
  deploymentNames: string[];
}

export function ProjectGroupRestartButton({
  namespace,
  partOf,
  deploymentNames,
}: ProjectGroupRestartButtonProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const queryClient = useQueryClient();
  const { countRestartPendingByNames } = useDeploymentRestartStore();
  const restartLabel = t('deployments:projectGroups.restart');
  const pendingCount = countRestartPendingByNames(namespace, deploymentNames);
  const groupRestarting = pendingCount > 0;

  const restartMutation = useAppMutation({
    mutationFn: () => api.restartProjectGroup(namespace, partOf),
    successMessage: t('toast:deployment.projectGroupRestartSuccess'),
    errorMessage: t('toast:deployment.projectGroupRestartError'),
    onSuccess: async (result) => {
      markDeploymentsRestarting(namespace, result.restarted);
      await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      await queryClient.invalidateQueries({ queryKey: ['pods', namespace] });
    },
    onError: () => {
      clearDeploymentsRestarting(namespace, deploymentNames);
    },
  });

  const handleClick = () => {
    markDeploymentsRestarting(namespace, deploymentNames);
    restartMutation.mutate();
  };

  if (!canOperate) {
    return null;
  }

  return (
    <HoverTooltip label={restartLabel}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleClick();
        }}
        disabled={restartMutation.isPending || groupRestarting}
        aria-label={restartLabel}
        className={`${deploymentIconButtonClass} ${
          restartMutation.isPending || groupRestarting ? 'animate-pulse text-warning' : ''
        }`}
      >
        <RestartIcon />
      </button>
    </HoverTooltip>
  );
}
