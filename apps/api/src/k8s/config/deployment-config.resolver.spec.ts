import { describe, expect, it } from 'vitest';
import * as k8s from '@kubernetes/client-node';
import {
  mergeEnvVars,
  resolveImageDefaults,
  toDeploymentConfigSummary,
} from './deployment-config.resolver';
import { createDeploymentEnvPatch } from '../patches/deployment-env.patch';

describe('deployment-config.resolver', () => {
  it('returns mysql defaults with hint', () => {
    const defaults = resolveImageDefaults('mysql:8.4');

    expect(defaults.env).toEqual(
      expect.arrayContaining([
        { name: 'MYSQL_ROOT_PASSWORD', value: 'dev-root-password' },
        { name: 'MYSQL_DATABASE', value: 'app' },
      ]),
    );
    expect(defaults.hint).toContain('MYSQL_ROOT_PASSWORD');
  });

  it('merges user env over image defaults', () => {
    const merged = mergeEnvVars(
      [{ name: 'MYSQL_ROOT_PASSWORD', value: 'dev-root-password' }],
      [{ name: 'MYSQL_ROOT_PASSWORD', value: 'custom' }, { name: 'TZ', value: 'UTC' }],
    );

    expect(merged).toEqual([
      { name: 'MYSQL_ROOT_PASSWORD', value: 'custom' },
      { name: 'TZ', value: 'UTC' },
    ]);
  });

  it('maps deployment env to summary', () => {
    const deployment: k8s.V1Deployment = {
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: 'demo',
                ports: [{ containerPort: 3306 }],
                env: [{ name: 'MYSQL_ROOT_PASSWORD', value: 'secret' }],
              },
            ],
          },
        },
      },
    };

    expect(toDeploymentConfigSummary(deployment)).toEqual({
      containerPort: 3306,
      containerName: 'demo',
      env: [{ name: 'MYSQL_ROOT_PASSWORD', value: 'secret' }],
      probes: [],
    });
  });
});

describe('deployment-env.patch', () => {
  it('builds json patch for primary container env', () => {
    const deployment: k8s.V1Deployment = {
      spec: {
        template: {
          spec: {
            containers: [{ name: 'demo', env: [{ name: 'OLD', value: '1' }] }],
          },
        },
      },
    };

    expect(createDeploymentEnvPatch(deployment, [{ name: 'NEW', value: '2' }])).toEqual([
      {
        op: 'replace',
        path: '/spec/template/spec/containers/0/env',
        value: [{ name: 'NEW', value: '2' }],
      },
    ]);
  });
});
