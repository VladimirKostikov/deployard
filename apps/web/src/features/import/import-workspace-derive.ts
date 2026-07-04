import type { ComposeImportPreview, ComposeProjectSummary } from '@dpd/shared';
import {
  defaultLocalImageTag,
  mergeLocalImageOverrides,
  resolveImportProjectId,
  resolveImportProjectName,
} from '@dpd/shared';
import type { ImportSourceMode } from './import-flow';
import { hasValidSource } from './import-flow';

export function deriveOverrideServices(
  preview: ComposeImportPreview | null,
  selectedProject: ComposeProjectSummary | undefined,
  imageOverrides: Record<string, string>,
) {
  const fromPreview = preview?.services.filter((service) => service.hasBuild) ?? [];
  if (fromPreview.length > 0) {
    return fromPreview;
  }

  const fromProject = selectedProject?.buildServices ?? [];
  if (fromProject.length > 0) {
    return fromProject.map((name) => ({ name, hasBuild: true }));
  }

  return Object.keys(imageOverrides).map((name) => ({ name, hasBuild: true }));
}

export function deriveImagesToLoad(
  preview: ComposeImportPreview | null,
  selectedProject: ComposeProjectSummary | undefined,
  imageOverrides: Record<string, string>,
) {
  if (preview?.services.length) {
    return preview.services
      .filter((service) => service.hasBuild)
      .map((service) => service.image.trim())
      .filter(Boolean);
  }

  const projectName = selectedProject?.name;
  const buildServices = selectedProject?.buildServices ?? Object.keys(imageOverrides);
  const merged = mergeLocalImageOverrides(buildServices, imageOverrides, projectName);

  return Object.values(merged)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function deriveRebuildUnavailableReason(
  mode: ImportSourceMode,
  selectedProjectId: string,
  dockerAvailable: boolean | undefined,
) {
  if (mode !== 'projects' || !selectedProjectId) {
    return null;
  }

  if (dockerAvailable === false) {
    return 'dockerUnavailable' as const;
  }

  return null;
}

export function buildSuggestedImageOverrides(project: ComposeProjectSummary) {
  const suggested: Record<string, string> = {};
  for (const service of project.buildServices) {
    suggested[service] = defaultLocalImageTag(service, project.name);
  }
  return suggested;
}

export function resolveImportBuildServiceNames(
  selectedProject: ComposeProjectSummary | undefined,
  overrideServices: Array<{ name: string; hasBuild: boolean }>,
) {
  if (selectedProject?.buildServices?.length) {
    return selectedProject.buildServices;
  }

  return overrideServices.filter((service) => service.hasBuild).map((service) => service.name);
}

export function resolveImportProjectContext(
  selectedProjectId: string,
  preview: ComposeImportPreview | null,
  projects: ComposeProjectSummary[],
  selectedProject: ComposeProjectSummary | undefined,
) {
  const projectName = resolveImportProjectName(preview, selectedProject);
  const projectId = resolveImportProjectId(selectedProjectId, preview, projects);
  return { projectId, projectName };
}

export function isImportSourceReady(
  mode: ImportSourceMode,
  selectedProjectId: string,
  composeYaml: string,
) {
  return hasValidSource(mode, selectedProjectId, composeYaml);
}

export function mergePreviewImageOverrides(preview: ComposeImportPreview) {
  const fromPreview: Record<string, string> = {};
  for (const service of preview.services) {
    if (service.hasBuild) {
      fromPreview[service.name] = service.image;
    }
  }
  return fromPreview;
}
