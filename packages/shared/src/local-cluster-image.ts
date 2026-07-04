import { composeK8sResourceName, sanitizeK8sNamePart } from './compose-k8s-resource-name';

export function isLocalClusterImage(image: string): boolean {
  return image.trim().endsWith(':local');
}

export function defaultLocalImageTag(serviceName: string, projectName?: string): string {
  const project = projectName?.trim();
  if (!project) {
    return `${serviceName}:local`;
  }

  const resource = composeK8sResourceName(project, serviceName);
  const service = sanitizeK8sNamePart(serviceName);
  const scoped = `${sanitizeK8sNamePart(project)}-${service}`;

  if (resource !== scoped) {
    const suffix = resource.startsWith(`${sanitizeK8sNamePart(project)}-`)
      ? resource.slice(sanitizeK8sNamePart(project).length + 1)
      : resource.includes('-')
        ? resource.split('-').slice(1).join('-')
        : resource;

    if (suffix) {
      return `${sanitizeK8sNamePart(project)}-${suffix}:local`;
    }
  }

  return `${scoped}:local`;
}

export function mergeLocalImageOverrides(
  buildServices: string[],
  imageOverrides: Record<string, string> = {},
  projectName?: string,
): Record<string, string> {
  const merged = { ...imageOverrides };

  for (const serviceName of buildServices) {
    const current = merged[serviceName]?.trim();
    const scoped = defaultLocalImageTag(serviceName, projectName);

    if (!current) {
      merged[serviceName] = scoped;
      continue;
    }

    if (projectName && current === `${serviceName}:local` && scoped !== current) {
      merged[serviceName] = scoped;
    }
  }

  return merged;
}
