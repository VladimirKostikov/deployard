import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { DeploymentSummary } from '@dpd/shared';
import { AppSection } from '@dpd/shared';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { PlayIcon, PauseIcon } from '../../components/icons/DeploymentActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { Button } from '../../components/ui/Button';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { usePods } from '../../hooks/kubernetes/usePods';
import {
  buildEnableIconButtonClass,
  resolveEnableErrorHighlight,
} from './deployment-enable-icon';
import { deploymentIconButtonClass } from './deployment-icon-button';

interface DeploymentDisableActionsProps {
  namespace: string;
  name: string;
  deployment: DeploymentSummary;
  variant?: 'icons' | 'buttons';
}

export function DeploymentDisableActions({
  namespace,
  name,
  deployment,
  variant = 'icons',
}: DeploymentDisableActionsProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const queryClient = useQueryClient();
  const { data: pods } = usePods(namespace, name, { enabled: deployment.disabled });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
    await queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name] });
    await queryClient.invalidateQueries({ queryKey: ['pods', namespace, name] });
  };

  const disableMutation = useAppMutation({
    mutationFn: () => api.disableDeployment(namespace, name),
    successMessage: t('toast:deployment.disableSuccess'),
    errorMessage: t('toast:deployment.disableError'),
    onSuccess: invalidate,
  });

  const enableMutation = useAppMutation({
    mutationFn: () => api.enableDeployment(namespace, name),
    successMessage: t('toast:deployment.enableSuccess'),
    errorMessage: t('toast:deployment.enableError'),
    onSuccess: invalidate,
  });

  const isPending = disableMutation.isPending || enableMutation.isPending;
  const hasError = resolveEnableErrorHighlight(
    deployment,
    pods,
    enableMutation.isError,
  );

  if (!canOperate) {
    return null;
  }

  if (deployment.disabled) {
    const restoreReplicas = deployment.previousReplicas ?? 1;

    if (variant === 'buttons') {
      return (
        <div className="space-y-2">
          <Button
            variant={hasError ? 'danger' : 'primary'}
            className={hasError ? 'enable-play-button enable-play-button-error' : 'enable-play-button'}
            onClick={() => enableMutation.mutate()}
            disabled={isPending}
          >
            {isPending ? t('disable.enabling') : t('disable.enable')}
          </Button>
          <p className={`text-xs ${hasError ? 'text-danger' : 'text-secondary'}`}>
            {hasError
              ? t('disable.enableErrorHint', { replicas: restoreReplicas })
              : t('disable.enableHint', { replicas: restoreReplicas })}
          </p>
        </div>
      );
    }

    return (
      <HoverTooltip
        label={
          hasError
            ? t('actions.enableAfterError')
            : t('actions.enable')
        }
      >
        <button
          type="button"
          onClick={() => enableMutation.mutate()}
          disabled={isPending}
          aria-label={t('actions.enable')}
          className={buildEnableIconButtonClass(hasError, isPending)}
        >
          <PlayIcon className={isPending ? 'opacity-80' : undefined} />
        </button>
      </HoverTooltip>
    );
  }

  if (deployment.replicas === 0) {
    return null;
  }

  if (variant === 'buttons') {
    return (
      <div className="space-y-2">
        <Button
          variant="secondary"
          onClick={() => disableMutation.mutate()}
          disabled={isPending}
        >
          {isPending ? t('disable.disabling') : t('disable.disable')}
        </Button>
      </div>
    );
  }

  return (
    <HoverTooltip label={t('actions.disable')}>
      <button
        type="button"
        onClick={() => disableMutation.mutate()}
        disabled={isPending}
        aria-label={t('actions.disable')}
        className={`${deploymentIconButtonClass} text-secondary hover:border-secondary/60 hover:bg-canvas focus-visible:ring-border`}
      >
        <PauseIcon />
      </button>
    </HoverTooltip>
  );
}
