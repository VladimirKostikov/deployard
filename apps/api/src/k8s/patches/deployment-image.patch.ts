import * as k8s from '@kubernetes/client-node';
import { resolvePrimaryContainerIndex } from './deployment-container-index';

export interface JsonPatchOperation {
  op: 'replace';
  path: string;
  value: string | number | k8s.V1EnvVar[];
}

export function createDeploymentImagePatch(
  deployment: k8s.V1Deployment,
  image: string,
): JsonPatchOperation[] {
  const index = resolvePrimaryContainerIndex(deployment);

  return [
    {
      op: 'replace',
      path: `/spec/template/spec/containers/${index}/image`,
      value: image,
    },
  ];
}

export function createDeploymentReplicasPatch(replicas: number): JsonPatchOperation[] {
  return [
    {
      op: 'replace',
      path: '/spec/replicas',
      value: replicas,
    },
  ];
}
