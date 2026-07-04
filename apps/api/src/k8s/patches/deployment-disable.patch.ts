import * as k8s from '@kubernetes/client-node';
import {
  DEPLOYMENT_DISABLED_ANNOTATION,
  DEPLOYMENT_DISABLED_WITH_ERRORS_ANNOTATION,
  DEPLOYMENT_PREVIOUS_REPLICAS_ANNOTATION,
} from '@dpd/shared';

type PatchOperation =
  | { op: 'add'; path: string; value: string | number | Record<string, unknown> }
  | { op: 'replace'; path: string; value: string | number }
  | { op: 'remove'; path: string };

function annotationPath(key: string): string {
  return `/metadata/annotations/${key.replace('/', '~1')}`;
}

function ensureMetadataOperations(
  deployment: k8s.V1Deployment,
  operations: PatchOperation[],
): void {
  if (!deployment.metadata) {
    operations.push({ op: 'add', path: '/metadata', value: {} });
  }

  if (!deployment.metadata?.annotations) {
    operations.push({ op: 'add', path: '/metadata/annotations', value: {} });
  }
}

function setAnnotation(
  deployment: k8s.V1Deployment,
  operations: PatchOperation[],
  key: string,
  value: string,
): void {
  const path = annotationPath(key);
  const existing = deployment.metadata?.annotations?.[key];

  if (existing === undefined) {
    operations.push({ op: 'add', path, value });
    return;
  }

  operations.push({ op: 'replace', path, value });
}

export function createDeploymentDisablePatch(
  deployment: k8s.V1Deployment,
  previousReplicas: number,
  hadErrors = false,
): PatchOperation[] {
  const operations: PatchOperation[] = [];

  ensureMetadataOperations(deployment, operations);
  setAnnotation(deployment, operations, DEPLOYMENT_DISABLED_ANNOTATION, 'true');
  setAnnotation(
    deployment,
    operations,
    DEPLOYMENT_PREVIOUS_REPLICAS_ANNOTATION,
    String(previousReplicas),
  );

  if (hadErrors) {
    setAnnotation(deployment, operations, DEPLOYMENT_DISABLED_WITH_ERRORS_ANNOTATION, 'true');
  }

  operations.push({ op: 'replace', path: '/spec/replicas', value: 0 });

  return operations;
}

export function createDeploymentEnablePatch(
  deployment: k8s.V1Deployment,
  replicas: number,
): PatchOperation[] {
  const operations: PatchOperation[] = [{ op: 'replace', path: '/spec/replicas', value: replicas }];
  const annotations = deployment.metadata?.annotations;

  if (annotations?.[DEPLOYMENT_DISABLED_ANNOTATION] !== undefined) {
    operations.push({ op: 'remove', path: annotationPath(DEPLOYMENT_DISABLED_ANNOTATION) });
  }

  if (annotations?.[DEPLOYMENT_PREVIOUS_REPLICAS_ANNOTATION] !== undefined) {
    operations.push({ op: 'remove', path: annotationPath(DEPLOYMENT_PREVIOUS_REPLICAS_ANNOTATION) });
  }

  if (annotations?.[DEPLOYMENT_DISABLED_WITH_ERRORS_ANNOTATION] !== undefined) {
    operations.push({ op: 'remove', path: annotationPath(DEPLOYMENT_DISABLED_WITH_ERRORS_ANNOTATION) });
  }

  return operations;
}

export function createDeploymentClearDisablePatch(
  deployment: k8s.V1Deployment,
): PatchOperation[] {
  const operations: PatchOperation[] = [];
  const annotations = deployment.metadata?.annotations;

  if (annotations?.[DEPLOYMENT_DISABLED_ANNOTATION] !== undefined) {
    operations.push({ op: 'remove', path: annotationPath(DEPLOYMENT_DISABLED_ANNOTATION) });
  }

  if (annotations?.[DEPLOYMENT_PREVIOUS_REPLICAS_ANNOTATION] !== undefined) {
    operations.push({ op: 'remove', path: annotationPath(DEPLOYMENT_PREVIOUS_REPLICAS_ANNOTATION) });
  }

  if (annotations?.[DEPLOYMENT_DISABLED_WITH_ERRORS_ANNOTATION] !== undefined) {
    operations.push({ op: 'remove', path: annotationPath(DEPLOYMENT_DISABLED_WITH_ERRORS_ANNOTATION) });
  }

  return operations;
}
