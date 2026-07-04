import * as k8s from '@kubernetes/client-node';

const RESTART_ANNOTATION = 'kubectl.kubernetes.io/restartedAt';
const RESTART_PATH = `/spec/template/metadata/annotations/${RESTART_ANNOTATION.replace('/', '~1')}`;

export type DeploymentRestartPatchOperation =
  | { op: 'add'; path: string; value: string | Record<string, unknown> }
  | { op: 'replace'; path: string; value: string };

export function createDeploymentRestartPatch(
  deployment: k8s.V1Deployment,
): DeploymentRestartPatchOperation[] {
  const restartedAt = new Date().toISOString();
  const templateMetadata = deployment.spec?.template?.metadata;
  const annotations = templateMetadata?.annotations;

  if (annotations && RESTART_ANNOTATION in annotations) {
    return [{ op: 'replace', path: RESTART_PATH, value: restartedAt }];
  }

  const operations: DeploymentRestartPatchOperation[] = [];

  if (!templateMetadata) {
    operations.push({ op: 'add', path: '/spec/template/metadata', value: {} });
  }

  if (!annotations) {
    operations.push({ op: 'add', path: '/spec/template/metadata/annotations', value: {} });
  }

  operations.push({ op: 'add', path: RESTART_PATH, value: restartedAt });
  return operations;
}
