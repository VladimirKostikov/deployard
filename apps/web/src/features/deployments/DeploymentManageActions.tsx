import type { DeploymentSummary } from '@dpd/shared';
import { AppSection } from '@dpd/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { DeleteIcon, RestartIcon } from '../../components/icons/DeploymentActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { DeploymentDisableActions } from './DeploymentDisableActions';
import { markDeploymentsRestarting } from './deployment-restart-store';
import { deploymentIconButtonClass } from './deployment-icon-button';

interface DeploymentManageActionsProps {
  namespace: string;
  name: string;
  deployment?: DeploymentSummary;
  onDeleted?: () => void;
}

export function DeploymentManageActions({
  namespace,
  name,
  deployment,
  onDeleted,
}: DeploymentManageActionsProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate, canManage } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
    await queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name] });
    await queryClient.invalidateQueries({ queryKey: ['pods', namespace, name] });
  };

  const restartMutation = useAppMutation({
    mutationFn: () => api.restartDeployment(namespace, name),
    successMessage: t('toast:deployment.restartSuccess'),
    errorMessage: t('toast:deployment.restartError'),
    onSuccess: async () => {
      markDeploymentsRestarting(namespace, [name]);
      await invalidate();
    },
  });

  const deleteMutation = useAppMutation({
    mutationFn: () => api.deleteDeployment(namespace, name),
    successMessage: t('toast:deployment.deleteSuccess'),
    errorMessage: t('toast:deployment.deleteError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      setConfirmDelete(false);
      if (onDeleted) {
        onDeleted();
        return;
      }
      navigate('/');
    },
    onError: () => {
      setConfirmDelete(false);
    },
  });

  if (!canOperate && !canManage) {
    return null;
  }

  return (
    <div className="min-w-[11rem]">
      <div className="flex flex-nowrap items-center gap-2">
        {deployment && canOperate ? (
          <DeploymentDisableActions
            namespace={namespace}
            name={name}
            deployment={deployment}
          />
        ) : null}
        {canOperate ? (
          <HoverTooltip label={t('deployments:actions.restart')}>
            <button
              type="button"
              onClick={() => restartMutation.mutate()}
              disabled={restartMutation.isPending || deployment?.disabled}
              aria-label={t('deployments:actions.restart')}
              className={`${deploymentIconButtonClass} text-secondary hover:border-warning/40 hover:bg-warning-soft/40 hover:text-warning focus-visible:ring-warning/30`}
            >
              <RestartIcon />
            </button>
          </HoverTooltip>
        ) : null}
        {canManage ? (
          <HoverTooltip label={t('deployments:actions.delete')}>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label={t('deployments:actions.delete')}
              className={`${deploymentIconButtonClass} text-danger hover:border-danger/40 hover:bg-danger-soft/40 focus-visible:ring-danger/30`}
            >
              <DeleteIcon />
            </button>
          </HoverTooltip>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('deployments:delete.title')}
        message={t('deployments:delete.message', { name })}
        isPending={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
