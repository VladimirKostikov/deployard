import { sanitizeK8sNamePart } from './compose-k8s-resource-name';

export const COMPOSE_PROJECT_RESOURCE_ALIASES: Record<string, Record<string, string>> = {
  'demo-shop': {
    postgres: 'demo-db',
    web: 'demo-web',
    'demo-api': 'demo-api',
  },
};

export function resolveComposeResourceAlias(
  projectName: string,
  serviceName: string,
): string | null {
  const project = sanitizeK8sNamePart(projectName);
  const service = sanitizeK8sNamePart(serviceName);
  return COMPOSE_PROJECT_RESOURCE_ALIASES[project]?.[service] ?? null;
}

export function resolveComposeServiceFromResource(
  projectName: string,
  resourceName: string,
): string {
  const project = sanitizeK8sNamePart(projectName);
  const resource = sanitizeK8sNamePart(resourceName);

  for (const [service, alias] of Object.entries(COMPOSE_PROJECT_RESOURCE_ALIASES[project] ?? {})) {
    if (alias === resource) {
      return service;
    }
  }

  const prefix = `${project}-`;
  if (project && resource.startsWith(prefix)) {
    const service = resource.slice(prefix.length);
    return service || resource;
  }

  return resource;
}
