import type { DeploymentSummary } from '@dpd/shared';
import { AppSection } from '@dpd/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { PauseIcon } from '../../components/icons/DeploymentActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { deploymentIconButtonClass } from './deployment-icon-button';

interface ProjectGroupDisableButtonProps {
  namespace: string;
  partOf: string;
  deployments: DeploymentSummary[];
}

function hasActiveDeployments(deployments: DeploymentSummary[]): boolean {
  return deployments.some((deployment) => !deployment.disabled && deployment.replicas > 0);
}

export function ProjectGroupDisableButton({
  namespace,
  partOf,
  deployments,
}: ProjectGroupDisableButtonProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const queryClient = useQueryClient();
  const disableLabel = t('deployments:projectGroups.disable');
  const canDisable = hasActiveDeployments(deployments);

  const disableMutation = useAppMutation({
    mutationFn: () => api.disableProjectGroup(namespace, partOf),
    successMessage: t('toast:deployment.projectGroupDisableSuccess'),
    errorMessage: t('toast:deployment.projectGroupDisableError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      await queryClient.invalidateQueries({ queryKey: ['pods', namespace] });
    },
  });

  if (!canOperate) {
    return null;
  }

  return (
    <HoverTooltip label={disableLabel}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          disableMutation.mutate();
        }}
        disabled={!canDisable || disableMutation.isPending}
        aria-label={disableLabel}
        className={`${deploymentIconButtonClass} text-secondary hover:border-secondary/60 hover:bg-canvas focus-visible:ring-border disabled:opacity-40`}
      >
        <PauseIcon />
      </button>
    </HoverTooltip>
  );
}
