import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { AppSection } from '@dpd/shared';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { useAppMutation } from '../../hooks/use-app-mutation';
import {
  refreshPods,
  removePodFromCache,
} from '../../hooks/kubernetes/pods-query';
import { useState } from 'react';
import type { PodSummary } from '@dpd/shared';
import { ConsoleIcon, DeleteIcon, RestartIcon } from '../../components/icons/PodActionIcons';

interface PodRowActionsProps {
  namespace: string;
  deploymentName: string;
  pod: PodSummary;
}

export function PodRowActions({ namespace, deploymentName, pod }: PodRowActionsProps) {
  const { t } = useTranslation(['pods', 'toast']);
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const queryClient = useQueryClient();
  const [, setSearchParams] = useSearchParams();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invalidate = async () => {
    await refreshPods(queryClient, namespace, deploymentName);
    await queryClient.invalidateQueries({ queryKey: ['deployment', namespace, deploymentName] });
  };

  const restartMutation = useAppMutation({
    mutationFn: () => api.restartPod(namespace, deploymentName, pod.name),
    successMessage: t('toast:pod.restartSuccess'),
    errorMessage: t('toast:pod.restartError'),
    onMutate: () => {
      removePodFromCache(queryClient, namespace, deploymentName, pod.name);
    },
    onSuccess: invalidate,
    onError: () => {
      void refreshPods(queryClient, namespace, deploymentName);
    },
  });

  const deleteMutation = useAppMutation({
    mutationFn: () => api.deletePod(namespace, deploymentName, pod.name),
    successMessage: t('toast:pod.deleteSuccess'),
    errorMessage: t('toast:pod.deleteError'),
    onMutate: () => {
      removePodFromCache(queryClient, namespace, deploymentName, pod.name);
    },
    onSuccess: async () => {
      await invalidate();
      setConfirmDelete(false);
    },
    onError: () => {
      void refreshPods(queryClient, namespace, deploymentName);
    },
  });

  const openConsole = () => {
    setSearchParams({ tab: 'console', pod: pod.name });
  };

  if (!canOperate) {
    return <span className="text-xs text-secondary">—</span>;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <HoverTooltip label={t('actions.restart')}>
          <button
            type="button"
            onClick={() => restartMutation.mutate()}
            disabled={restartMutation.isPending}
            aria-label={t('actions.restart')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-apple border border-border bg-elevated text-secondary transition-all hover:border-warning/40 hover:bg-warning-soft/40 hover:text-warning hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/30 disabled:opacity-50"
          >
            <RestartIcon />
          </button>
        </HoverTooltip>
        <HoverTooltip label={t('actions.console')}>
          <button
            type="button"
            onClick={openConsole}
            aria-label={t('actions.console')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-apple border border-border bg-elevated text-secondary transition-all hover:border-accent/40 hover:bg-accent-soft/40 hover:text-accent hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <ConsoleIcon />
          </button>
        </HoverTooltip>
        <HoverTooltip label={t('actions.delete')}>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={t('actions.delete')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-apple border border-danger/30 bg-danger text-white transition-all hover:opacity-90 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
          >
            <DeleteIcon />
          </button>
        </HoverTooltip>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('delete.title')}
        message={t('delete.message', { name: pod.name })}
        isPending={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
