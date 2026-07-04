import { describe, expect, it } from 'vitest';
import * as k8s from '@kubernetes/client-node';
import { createDeploymentImagePatch, createDeploymentReplicasPatch } from './deployment-image.patch';

describe('deployment-image.patch', () => {
  it('builds json patch for the primary container image', () => {
    const deployment: k8s.V1Deployment = {
      metadata: { name: 'demo-api' },
      spec: {
        template: {
          spec: {
            containers: [
              { name: 'demo-api', image: 'nginx:1.27-alpine' },
              { name: 'sidecar', image: 'redis:7.4-alpine' },
            ],
          },
        },
      },
    };

    expect(createDeploymentImagePatch(deployment, 'nginx:1.28-alpine')).toEqual([
      {
        op: 'replace',
        path: '/spec/template/spec/containers/0/image',
        value: 'nginx:1.28-alpine',
      },
    ]);
  });

  it('builds json patch for replicas', () => {
    expect(createDeploymentReplicasPatch(3)).toEqual([
      { op: 'replace', path: '/spec/replicas', value: 3 },
    ]);
  });
});
