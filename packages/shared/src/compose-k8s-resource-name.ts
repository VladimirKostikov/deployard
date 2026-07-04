import { resolveComposeResourceAlias, resolveComposeServiceFromResource } from './compose-project-aliases';

const K8S_NAME_MAX_LENGTH = 63;

export function sanitizeK8sNamePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function composeK8sResourceName(projectName: string, serviceName: string): string {
  const project = sanitizeK8sNamePart(projectName);
  const service = sanitizeK8sNamePart(serviceName);

  if (!project) {
    return trimToK8sName(service);
  }

  if (!service || service === project || service.startsWith(`${project}-`)) {
    return trimToK8sName(service || project);
  }

  const alias = resolveComposeResourceAlias(project, service);
  if (alias) {
    return trimToK8sName(alias);
  }

  return trimToK8sName(`${project}-${service}`);
}

export function composeK8sSecretName(projectName: string, serviceName: string): string {
  return `${composeK8sResourceName(projectName, serviceName)}-env`;
}

export function composeServiceNameFromResourceName(
  projectName: string,
  resourceName: string,
): string {
  return resolveComposeServiceFromResource(projectName, resourceName);
}

function trimToK8sName(value: string): string {
  if (value.length <= K8S_NAME_MAX_LENGTH) {
    return value;
  }

  return value.slice(0, K8S_NAME_MAX_LENGTH).replace(/-$/, '');
}
