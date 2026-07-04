import { describe, expect, it } from 'vitest';
import * as k8s from '@kubernetes/client-node';
import {
  buildReplicaSetLabelSelector,
  createRolloutUndoPatch,
  findReplicaSetByRevision,
} from './deployment-rollback.patch';

describe('deployment rollback patch', () => {
  it('builds label selector from deployment match labels', () => {
    const deployment: k8s.V1Deployment = {
      spec: {
        selector: {
          matchLabels: {
            'app.kubernetes.io/name': 'demo-api',
          },
        },
      },
    };

    expect(buildReplicaSetLabelSelector(deployment)).toBe('app.kubernetes.io/name=demo-api');
  });

  it('finds replica set by revision annotation', () => {
    const replicaSets: k8s.V1ReplicaSet[] = [
      {
        metadata: { annotations: { 'deployment.kubernetes.io/revision': '1' } },
        spec: { template: { metadata: { labels: { app: 'v1' } } } },
      },
      {
        metadata: { annotations: { 'deployment.kubernetes.io/revision': '2' } },
        spec: { template: { metadata: { labels: { app: 'v2' } } } },
      },
    ];

    const found = findReplicaSetByRevision(replicaSets, 2);
    expect(found?.spec?.template?.metadata?.labels?.app).toBe('v2');
  });

  it('creates rollout undo patch from replica set template', () => {
    const replicaSet: k8s.V1ReplicaSet = {
      spec: {
        template: {
          metadata: {
            labels: {
              app: 'api',
              'pod-template-hash': 'abc123',
            },
          },
          spec: {
            containers: [{ name: 'api', image: 'nginx:1.27-alpine' }],
          },
        },
      },
    };

    expect(createRolloutUndoPatch(replicaSet, 2)).toEqual([
      {
        op: 'replace',
        path: '/spec/template',
        value: {
          metadata: {
            labels: {
              app: 'api',
            },
          },
          spec: {
            containers: [{ name: 'api', image: 'nginx:1.27-alpine' }],
          },
        },
      },
      {
        op: 'replace',
        path: '/metadata/annotations/kubernetes.io~1change-cause',
        value: 'Rollback to revision 2',
      },
    ]);
  });
});
