import { useMemo, useState } from 'react';
import type { ComposeImportPreview } from '@dpd/shared';
import { useComposeProjects, useImportEnvironment } from '../../hooks/kubernetes/useImport';
import type { ImportSourceMode } from './import-flow';
import type { ImportApplyProgress } from './import-apply-progress';
import {
  buildSuggestedImageOverrides,
  deriveImagesToLoad,
  deriveOverrideServices,
  deriveRebuildUnavailableReason,
  isImportSourceReady,
} from './import-workspace-derive';
import { useImportWorkspaceMutations } from './use-import-workspace-mutations';

export function useImportWorkspace(namespace: string) {
  const environmentQuery = useImportEnvironment();
  const projectsQuery = useComposeProjects();

  const [mode, setMode] = useState<ImportSourceMode>('projects');
  const [composeYaml, setComposeYaml] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [exposeHostPorts, setExposeHostPorts] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<ComposeImportPreview | null>(null);
  const [applyProgress, setApplyProgress] = useState<ImportApplyProgress | null>(null);

  const selectedProject = useMemo(
    () => projectsQuery.data?.projects.find((project) => project.id === selectedProjectId),
    [projectsQuery.data?.projects, selectedProjectId],
  );

  const sourceReady = isImportSourceReady(mode, selectedProjectId, composeYaml);

  const overrideServices = useMemo(
    () => deriveOverrideServices(preview, selectedProject, imageOverrides),
    [preview, selectedProject, imageOverrides],
  );

  const imagesToLoad = useMemo(
    () => deriveImagesToLoad(preview, selectedProject, imageOverrides),
    [imageOverrides, preview, selectedProject],
  );

  const canLoadImages = imagesToLoad.length > 0 && environmentQuery.data?.kindAvailable === true;

  const canRebuild =
    mode === 'projects' &&
    selectedProjectId.length > 0 &&
    environmentQuery.data?.dockerAvailable === true;

  const rebuildUnavailableReason = useMemo(
    () =>
      deriveRebuildUnavailableReason(
        mode,
        selectedProjectId,
        environmentQuery.data?.dockerAvailable,
      ),
    [mode, selectedProjectId, environmentQuery.data?.dockerAvailable],
  );

  const resetPreview = () => setPreview(null);

  const selectProject = (project: Parameters<typeof buildSuggestedImageOverrides>[0]) => {
    setSelectedProjectId(project.id);
    resetPreview();

    if (project.buildServices.length === 0) {
      setImageOverrides({});
      return;
    }

    setImageOverrides(buildSuggestedImageOverrides(project));
  };

  const changeMode = (nextMode: ImportSourceMode) => {
    setMode(nextMode);
    resetPreview();
  };

  const { loadMutation, previewMutation, applyMutation, handleRebuildSuccess } =
    useImportWorkspaceMutations({
      namespace,
      mode,
      composeYaml,
      selectedProjectId,
      selectedProject,
      projects: projectsQuery.data?.projects ?? [],
      imageOverrides,
      exposeHostPorts,
      preview,
      overrideServices,
      imagesToLoad,
      dockerAvailable: environmentQuery.data?.dockerAvailable,
      kindAvailable: environmentQuery.data?.kindAvailable,
      setPreview,
      setImageOverrides,
      setApplyProgress,
      resetPreview,
    });

  return {
    environmentQuery,
    projectsQuery,
    mode,
    composeYaml,
    selectedProject,
    selectedProjectId,
    exposeHostPorts,
    imageOverrides,
    preview,
    sourceReady,
    overrideServices,
    canLoadImages,
    canRebuild,
    rebuildUnavailableReason,
    changeMode,
    selectProject,
    setComposeYaml,
    setExposeHostPorts,
    setImageOverrides,
    resetPreview,
    handleRebuildSuccess,
    loadMutation,
    previewMutation,
    applyMutation,
    applyProgress,
  };
}
