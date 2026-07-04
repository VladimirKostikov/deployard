import type { ComposeImportPreview, ComposeProjectSummary } from './compose-import';

export function resolveImportProjectId(
  selectedProjectId: string,
  preview: ComposeImportPreview | null | undefined,
  projects: ComposeProjectSummary[],
): string | undefined {
  const selected = selectedProjectId.trim();
  if (selected) {
    return selected;
  }

  const projectName = preview?.projectName?.trim();
  if (!projectName) {
    return undefined;
  }

  return projects.find((project) => project.name === projectName && project.source === 'file')?.id;
}

export function resolveImportProjectName(
  preview: ComposeImportPreview | null | undefined,
  selectedProject: ComposeProjectSummary | undefined,
): string | undefined {
  return preview?.projectName?.trim() || selectedProject?.name?.trim() || undefined;
}
