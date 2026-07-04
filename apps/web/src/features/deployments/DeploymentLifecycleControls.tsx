import type { DeploymentSummary } from '@dpd/shared';
import { AppSection } from '@dpd/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { Button } from '../../components/ui/Button';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { DeploymentDisableActions } from './DeploymentDisableActions';

interface DeploymentLifecycleControlsProps {
  namespace: string;
  name: string;
  deployment: DeploymentSummary;
  onRestartStarted?: () => void;
}

export function DeploymentLifecycleControls({
  namespace,
  name,
  deployment,
  onRestartStarted,
}: DeploymentLifecycleControlsProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate, canManage } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name] });
    await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
    await queryClient.invalidateQueries({ queryKey: ['pods', namespace, name] });
    await queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name, 'history'] });
    await queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name, 'health'] });
  };

  const restartMutation = useAppMutation({
    mutationFn: () => api.restartDeployment(namespace, name),
    successMessage: t('toast:deployment.restartSuccess'),
    errorMessage: t('toast:deployment.restartError'),
    onSuccess: async () => {
      await invalidate();
      onRestartStarted?.();
    },
  });

  const deleteMutation = useAppMutation({
    mutationFn: () => api.deleteDeployment(namespace, name),
    successMessage: t('toast:deployment.deleteSuccess'),
    errorMessage: t('toast:deployment.deleteError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      setConfirmDelete(false);
      navigate('/');
    },
  });

  if (!canOperate && !canManage) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        {canOperate ? (
          <DeploymentDisableActions
            namespace={namespace}
            name={name}
            deployment={deployment}
            variant="buttons"
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          {canOperate ? (
            <Button
              variant="inverse"
              onClick={() => restartMutation.mutate()}
              disabled={restartMutation.isPending || deployment.disabled}
            >
              {restartMutation.isPending ? t('restart.submitting') : t('restart.submit')}
            </Button>
          ) : null}
          {canManage ? (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
              {t('delete.submit')}
            </Button>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('delete.title')}
        message={t('delete.message', { name })}
        isPending={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
