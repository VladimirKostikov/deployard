import { describe, expect, it } from 'vitest';
import * as k8s from '@kubernetes/client-node';
import { mapContainerProbes } from './deployment-probe.mapper';

describe('deployment-probe.mapper', () => {
  it('maps readiness, liveness, and startup probes', () => {
    const container: k8s.V1Container = {
      name: 'api',
      readinessProbe: {
        httpGet: { path: '/ready', port: 8080 },
        initialDelaySeconds: 5,
        periodSeconds: 10,
      },
      livenessProbe: {
        tcpSocket: { port: 8080 },
        periodSeconds: 20,
      },
      startupProbe: {
        exec: { command: ['cat', '/tmp/healthy'] },
        failureThreshold: 30,
      },
    };

    expect(mapContainerProbes(container)).toEqual([
      {
        type: 'readiness',
        mechanism: 'http',
        path: '/ready',
        port: 8080,
        initialDelaySeconds: 5,
        periodSeconds: 10,
        timeoutSeconds: undefined,
        successThreshold: undefined,
        failureThreshold: undefined,
      },
      {
        type: 'liveness',
        mechanism: 'tcp',
        port: 8080,
        periodSeconds: 20,
        path: undefined,
        command: undefined,
        initialDelaySeconds: undefined,
        timeoutSeconds: undefined,
        successThreshold: undefined,
        failureThreshold: undefined,
      },
      {
        type: 'startup',
        mechanism: 'exec',
        command: ['cat', '/tmp/healthy'],
        failureThreshold: 30,
        path: undefined,
        port: undefined,
        initialDelaySeconds: undefined,
        periodSeconds: undefined,
        timeoutSeconds: undefined,
        successThreshold: undefined,
      },
    ]);
  });

  it('returns empty list when container has no probes', () => {
    expect(mapContainerProbes({ name: 'demo' })).toEqual([]);
  });
});
