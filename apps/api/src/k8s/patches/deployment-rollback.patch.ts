import * as k8s from '@kubernetes/client-node';

const POD_TEMPLATE_HASH_LABEL = 'pod-template-hash';

export interface RollbackPatchOperation {
  op: 'replace';
  path: string;
  value: k8s.V1PodTemplateSpec | string;
}

export function buildReplicaSetLabelSelector(deployment: k8s.V1Deployment): string {
  const matchLabels = deployment.spec?.selector?.matchLabels ?? {};
  return Object.entries(matchLabels)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
}

export function findReplicaSetByRevision(
  replicaSets: k8s.V1ReplicaSet[],
  revision: number,
): k8s.V1ReplicaSet | undefined {
  return replicaSets.find(
    (item) =>
      Number(item.metadata?.annotations?.['deployment.kubernetes.io/revision'] ?? 0) === revision,
  );
}

export function createRolloutUndoPatch(
  replicaSet: k8s.V1ReplicaSet,
  targetRevision: number,
): RollbackPatchOperation[] {
  const template = cloneRollbackTemplate(replicaSet.spec?.template);
  if (!template) {
    throw new Error('ReplicaSet has no pod template');
  }

  return [
    {
      op: 'replace',
      path: '/spec/template',
      value: template,
    },
    {
      op: 'replace',
      path: '/metadata/annotations/kubernetes.io~1change-cause',
      value: `Rollback to revision ${targetRevision}`,
    },
  ];
}

function cloneRollbackTemplate(
  template?: k8s.V1PodTemplateSpec,
): k8s.V1PodTemplateSpec | undefined {
  if (!template) {
    return undefined;
  }

  const cloned: k8s.V1PodTemplateSpec = JSON.parse(JSON.stringify(template)) as k8s.V1PodTemplateSpec;

  if (cloned.metadata?.labels?.[POD_TEMPLATE_HASH_LABEL]) {
    const { [POD_TEMPLATE_HASH_LABEL]: _, ...labels } = cloned.metadata.labels;
    cloned.metadata.labels = labels;
  }

  return cloned;
}
