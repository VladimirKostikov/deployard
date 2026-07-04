import { describe, expect, it } from 'vitest';
import * as k8s from '@kubernetes/client-node';
import {
  createDeploymentClearDisablePatch,
  createDeploymentDisablePatch,
  createDeploymentEnablePatch,
} from './deployment-disable.patch';

function baseDeployment(replicas = 2): k8s.V1Deployment {
  return {
    metadata: {
      name: 'demo-api',
      namespace: 'default',
      annotations: {},
    },
    spec: {
      replicas,
      template: {
        spec: {
          containers: [{ name: 'app', image: 'demo:latest' }],
        },
      },
    },
  };
}

describe('deployment-disable.patch', () => {
    it('createDeploymentDisablePatch scales to zero and stores annotations', () => {
    const patch = createDeploymentDisablePatch(baseDeployment(), 2, true);

    expect(patch).toEqual(
      expect.arrayContaining([
        { op: 'add', path: '/metadata/annotations/deployard.io~1disabled', value: 'true' },
        { op: 'add', path: '/metadata/annotations/deployard.io~1previous-replicas', value: '2' },
        {
          op: 'add',
          path: '/metadata/annotations/deployard.io~1disabled-with-errors',
          value: 'true',
        },
        { op: 'replace', path: '/spec/replicas', value: 0 },
      ]),
    );
  });

  it('createDeploymentEnablePatch restores replicas and removes annotations', () => {
    const deployment = baseDeployment(0);
    deployment.metadata!.annotations = {
      'deployard.io/disabled': 'true',
      'deployard.io/previous-replicas': '3',
    };

    const patch = createDeploymentEnablePatch(deployment, 3);

    expect(patch).toEqual([
      { op: 'replace', path: '/spec/replicas', value: 3 },
      { op: 'remove', path: '/metadata/annotations/deployard.io~1disabled' },
      { op: 'remove', path: '/metadata/annotations/deployard.io~1previous-replicas' },
    ]);
  });

  it('createDeploymentClearDisablePatch removes disable annotations only', () => {
    const deployment = baseDeployment(1);
    deployment.metadata!.annotations = {
      'deployard.io/disabled': 'true',
      'deployard.io/previous-replicas': '2',
    };

    expect(createDeploymentClearDisablePatch(deployment)).toEqual([
      { op: 'remove', path: '/metadata/annotations/deployard.io~1disabled' },
      { op: 'remove', path: '/metadata/annotations/deployard.io~1previous-replicas' },
    ]);
  });
});
