import * as k8s from '@kubernetes/client-node';

export function resolvePrimaryContainerIndex(deployment: k8s.V1Deployment): number {
  const containers = deployment.spec?.template?.spec?.containers ?? [];
  const primaryName = containers[0]?.name ?? deployment.metadata?.name ?? 'app';
  const containerIndex = containers.findIndex((item) => item.name === primaryName);
  return containerIndex >= 0 ? containerIndex : 0;
}
