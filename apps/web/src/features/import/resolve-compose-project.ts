import type { ComposeProjectSummary } from '@dpd/shared';

export function resolveComposeProjectByName(
  projects: ComposeProjectSummary[],
  name: string,
): ComposeProjectSummary | undefined {
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return projects.find((project) => project.name.trim().toLowerCase() === normalized);
}
