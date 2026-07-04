import type { TFunction } from 'i18next';
import { mergeLocalImageOverrides } from '@dpd/shared';
import { api } from '../../api';
import { importApplyPercent, type ImportApplyProgress } from './import-apply-progress';
import {
  resolveImportBuildServiceNames,
  resolveImportProjectContext,
} from './import-workspace-derive';
import type { ImportWorkspaceMutationInput } from './import-workspace-mutation-input';

export async function runImportApply(
  input: ImportWorkspaceMutationInput,
  t: TFunction,
  setApplyProgress: (progress: ImportApplyProgress) => void,
) {
  const { projectId, projectName } = resolveImportProjectContext(
    input.selectedProjectId,
    input.preview,
    input.projects,
    input.selectedProject,
  );
  const buildServiceNames = resolveImportBuildServiceNames(
    input.selectedProject,
    input.overrideServices,
  );
  const resolvedOverrides = mergeLocalImageOverrides(
    buildServiceNames,
    input.imageOverrides,
    projectName,
  );

  const dockerAvailable = input.dockerAvailable ?? false;
  const kindAvailable = input.kindAvailable ?? false;

  let loadTargets: string[] = [];

  if (projectId && dockerAvailable) {
    setApplyProgress({ phase: 'build', percent: importApplyPercent('build') });
    const buildResult = await api.buildComposeProject({
      projectId,
      imageOverrides: resolvedOverrides,
    });

    if (buildResult.taggedImages.length === 0) {
      throw new Error(t('import:errors.buildNoTaggedImages'));
    }

    loadTargets = buildResult.taggedImages;
  } else if (input.imagesToLoad.length > 0) {
    loadTargets = input.imagesToLoad;
  } else if (Object.keys(resolvedOverrides).length > 0) {
    loadTargets = [
      ...new Set(
        Object.values(resolvedOverrides)
          .map((image) => image.trim())
          .filter(Boolean),
      ),
    ];
  }

  if (loadTargets.length > 0 && kindAvailable) {
    setApplyProgress({ phase: 'load', percent: importApplyPercent('load') });
    const loadResult = await api.loadImagesToCluster({
      images: loadTargets,
      projectId,
      projectName,
      imageOverrides: resolvedOverrides,
    });
    if (loadResult.failed.length > 0) {
      const details = loadResult.failed
        .map((entry) => `${entry.image}: ${entry.error}`)
        .join('; ');
      throw new Error(details);
    }
  }

  setApplyProgress({ phase: 'apply', percent: importApplyPercent('apply') });

  if (projectId) {
    return api.applyProjectImport({
      namespace: input.namespace,
      projectId,
      imageOverrides: resolvedOverrides,
      exposeHostPorts: input.exposeHostPorts,
      skipImagePrepare: true,
    });
  }

  return api.applyComposeImport({
    namespace: input.namespace,
    composeYaml: input.composeYaml,
    imageOverrides: resolvedOverrides,
    projectName,
    exposeHostPorts: input.exposeHostPorts,
    skipImagePrepare: true,
  });
}
