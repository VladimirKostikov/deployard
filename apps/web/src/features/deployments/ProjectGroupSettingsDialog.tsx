import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { ComposeUpResult } from '@dpd/shared';
import { AppSection, mergeLocalImageOverrides } from '@dpd/shared';
import { Button } from '../../components/ui/Button';
import { useSectionAccess } from '../../auth/use-access';
import { useToast } from '../../components/ui/toast/use-toast';
import { Modal } from '../../components/ui/Modal';
import { useComposeProjects, useImportEnvironment } from '../../hooks/kubernetes/useImport';
import { ComposeRebuildPanel } from '../import/ComposeRebuildPanel';
import { notifyComposeRebuildClusterSync } from '../import/compose-rebuild-notify';
import { resolveComposeProjectByName } from '../import/resolve-compose-project';
import { ProjectGroupSettingsMeta } from './ProjectGroupSettingsMeta';

interface ProjectGroupSettingsDialogProps {
  open: boolean;
  namespace: string;
  partOf: string;
  label: string;
  serviceCount: number;
  onClose: () => void;
}

export function ProjectGroupSettingsDialog({
  open,
  namespace,
  partOf,
  label,
  serviceCount,
  onClose,
}: ProjectGroupSettingsDialogProps) {
  const { t } = useTranslation(['deployments', 'import', 'toast']);
  const toast = useToast();
  const queryClient = useQueryClient();
  const environmentQuery = useImportEnvironment();
  const projectsQuery = useComposeProjects(open);
  const { canManage: canImportManage } = useSectionAccess(AppSection.IMPORT, namespace);

  const composeProject = useMemo(
    () => resolveComposeProjectByName(projectsQuery.data?.projects ?? [], partOf),
    [projectsQuery.data?.projects, partOf],
  );

  const imageOverrides = useMemo(() => {
    if (!composeProject?.buildServices?.length) {
      return {};
    }

    return mergeLocalImageOverrides(composeProject.buildServices, {}, composeProject.name);
  }, [composeProject]);

  const dockerAvailable = environmentQuery.data?.dockerAvailable === true;
  const canRebuild = Boolean(composeProject) && dockerAvailable;
  const loading = environmentQuery.isLoading || projectsQuery.isLoading;

  const handleRebuildSuccess = async (result: ComposeUpResult) => {
    toast.success(t('toast:import.rebuildSuccess'));
    if (result.builtImages.length > 0) {
      toast.success(t('import:flow.rebuildDone', { count: result.builtImages.length }));
    }
    notifyComposeRebuildClusterSync(result, toast, t);
    await queryClient.invalidateQueries({ queryKey: ['import', 'projects'] });
    await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
  };

  return (
    <Modal
      open={open}
      title={t('projectGroups.settingsTitle')}
      onClose={onClose}
      panelClassName="max-w-lg"
    >
      <div className="space-y-4 text-sm">
        <ProjectGroupSettingsMeta
          label={label}
          serviceCount={serviceCount}
          composeProject={composeProject}
          dockerAvailable={dockerAvailable}
          dockerMessage={environmentQuery.data?.dockerMessage}
        />

        {loading ? (
          <p className="text-secondary">{t('projectGroups.settingsLoading')}</p>
        ) : composeProject && canImportManage ? (
          <ComposeRebuildPanel
            projectId={composeProject.id}
            namespace={namespace}
            partOf={partOf}
            imageOverrides={imageOverrides}
            canRebuild={canRebuild}
            rebuildUnavailableReason={dockerAvailable ? null : 'dockerUnavailable'}
            hint={t('projectGroups.settingsRebuildHint')}
            onSuccess={handleRebuildSuccess}
          />
        ) : (
          <p className="border border-dashed border-default bg-canvas p-4 text-secondary">
            {t('projectGroups.settingsNoCompose')}
          </p>
        )}

        <div className="flex justify-end border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('projectGroups.settingsClose')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
