import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSection } from '@dpd/shared';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { DeleteIcon } from '../../components/icons/DeploymentActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { deploymentIconButtonClass } from './deployment-icon-button';

interface ProjectGroupDeleteButtonProps {
  namespace: string;
  partOf: string;
  label: string;
}

export function ProjectGroupDeleteButton({
  namespace,
  partOf,
  label,
}: ProjectGroupDeleteButtonProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canManage } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const deleteLabel = t('deployments:projectGroups.delete');

  const deleteMutation = useAppMutation({
    mutationFn: () => api.deleteProjectGroup(namespace, partOf),
    successMessage: t('toast:deployment.projectGroupDeleteSuccess'),
    errorMessage: t('toast:deployment.projectGroupDeleteError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      await queryClient.invalidateQueries({ queryKey: ['network', 'services', namespace] });
      setOpen(false);
    },
  });

  if (!canManage) {
    return null;
  }

  return (
    <>
      <HoverTooltip label={deleteLabel}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
          disabled={deleteMutation.isPending}
          aria-label={deleteLabel}
          className={`${deploymentIconButtonClass} text-danger hover:border-danger/40 hover:bg-danger-soft/40 focus-visible:ring-danger/30`}
        >
          <DeleteIcon />
        </button>
      </HoverTooltip>

      <ConfirmDialog
        open={open}
        title={t('projectGroups.deleteTitle')}
        message={t('projectGroups.deleteMessage', { name: label })}
        isPending={deleteMutation.isPending}
        onCancel={() => setOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
