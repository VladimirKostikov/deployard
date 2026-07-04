import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { ComposeUpResult } from '@dpd/shared';
import { mergeLocalImageOverrides } from '@dpd/shared';
import { api } from '../../api';
import { useToast } from '../../components/ui/toast/use-toast';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { notifyComposeRebuildClusterSync } from './compose-rebuild-notify';
import { importApplyPercent } from './import-apply-progress';
import { runImportApply } from './import-workspace-apply-runner';
import type { ImportWorkspaceMutationInput } from './import-workspace-mutation-input';
import {
  mergePreviewImageOverrides,
  resolveImportBuildServiceNames,
  resolveImportProjectContext,
} from './import-workspace-derive';

export function useImportWorkspaceMutations(input: ImportWorkspaceMutationInput) {
  const { t } = useTranslation(['import', 'toast']);
  const toast = useToast();
  const queryClient = useQueryClient();

  const resolveContext = () =>
    resolveImportProjectContext(
      input.selectedProjectId,
      input.preview,
      input.projects,
      input.selectedProject,
    );

  const resolveBuildServices = () =>
    resolveImportBuildServiceNames(input.selectedProject, input.overrideServices);

  const loadMutation = useAppMutation({
    mutationFn: async () => {
      const { projectId, projectName } = resolveContext();
      const buildServiceNames = resolveBuildServices();
      const merged = mergeLocalImageOverrides(
        buildServiceNames,
        input.imageOverrides,
        projectName,
      );

      return api.loadImagesToCluster({
        images: input.imagesToLoad,
        projectId,
        projectName,
        imageOverrides: merged,
      });
    },
    errorMessage: t('toast:import.loadError'),
    onSuccess: (result) => {
      toast.success(t('prepare.loadSuccess', { count: result.loaded.length }));
      if (result.failed.length > 0) {
        toast.error(result.failed.map((entry) => `${entry.image}: ${entry.error}`).join('\n'));
      }
    },
  });

  const handleRebuildSuccess = async (result: ComposeUpResult) => {
    toast.success(t('toast:import.rebuildSuccess'));
    notifyComposeRebuildClusterSync(result, toast, t);
    await queryClient.invalidateQueries({ queryKey: ['import', 'projects'] });
    await queryClient.invalidateQueries({ queryKey: ['deployments', input.namespace] });
    input.resetPreview();
  };

  const previewMutation = useAppMutation({
    mutationFn: async () => {
      if (input.mode === 'projects') {
        return api.previewProjectImport({
          namespace: input.namespace,
          projectId: input.selectedProjectId,
          imageOverrides: input.imageOverrides,
          exposeHostPorts: input.exposeHostPorts,
        });
      }

      return api.previewComposeImport({
        namespace: input.namespace,
        composeYaml: input.composeYaml,
        imageOverrides: input.imageOverrides,
        exposeHostPorts: input.exposeHostPorts,
      });
    },
    errorMessage: t('toast:import.previewError'),
    onSuccess: (result) => {
      input.setPreview(result);

      const fromPreview = mergePreviewImageOverrides(result);
      if (Object.keys(fromPreview).length > 0) {
        input.setImageOverrides((current) => ({ ...current, ...fromPreview }));
      }
    },
    onError: () => {
      input.resetPreview();
    },
  });

  const applyMutation = useAppMutation({
    mutationFn: () =>
      runImportApply(input, t, (progress) => input.setApplyProgress(progress)),
    errorMessage: t('toast:import.applyError'),
    onSuccess: async (result) => {
      input.setApplyProgress({ phase: 'done', percent: importApplyPercent('done') });
      if (result.imagesLoaded?.length) {
        toast.success(t('toast:import.applyWithImages', { count: result.imagesLoaded.length }));
      } else {
        toast.success(t('toast:import.applySuccess'));
      }

      await queryClient.invalidateQueries({ queryKey: ['deployments', input.namespace] });
      await queryClient.invalidateQueries({ queryKey: ['network', 'services', input.namespace] });
      input.resetPreview();
      input.setApplyProgress(null);
    },
    onError: () => {
      input.setApplyProgress(null);
    },
  });

  return {
    loadMutation,
    previewMutation,
    applyMutation,
    handleRebuildSuccess,
  };
}
