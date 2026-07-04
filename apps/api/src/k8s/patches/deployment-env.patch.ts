import * as k8s from '@kubernetes/client-node';
import { JsonPatchOperation } from './deployment-image.patch';
import { resolvePrimaryContainerIndex } from './deployment-container-index';

export function createDeploymentEnvPatch(
  deployment: k8s.V1Deployment,
  env: k8s.V1EnvVar[],
): JsonPatchOperation[] {
  const index = resolvePrimaryContainerIndex(deployment);

  return [
    {
      op: 'replace',
      path: `/spec/template/spec/containers/${index}/env`,
      value: env,
    },
  ];
}
