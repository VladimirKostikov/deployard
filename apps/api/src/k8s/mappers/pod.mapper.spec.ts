import { describe, expect, it } from 'vitest';
import * as k8s from '@kubernetes/client-node';
import { PodMapper } from './pod.mapper';

describe('PodMapper', () => {
  const mapper = new PodMapper();

  it('maps pod summary with container states', () => {
    const pod: k8s.V1Pod = {
      metadata: { name: 'demo-api-abc', namespace: 'default' },
      spec: { nodeName: 'kind-worker' },
      status: {
        phase: 'Running',
        startTime: new Date('2026-06-23T12:00:00.000Z'),
        containerStatuses: [
          {
            name: 'api',
            ready: true,
            restartCount: 1,
            image: 'nginx:1.27-alpine',
            state: { running: { startedAt: new Date('2026-06-23T12:00:00.000Z') } },
          },
        ],
      },
    };

    const summary = mapper.toSummary(pod);

    expect(summary.name).toBe('demo-api-abc');
    expect(summary.phase).toBe('Running');
    expect(summary.ready).toBe(true);
    expect(summary.restarts).toBe(1);
    expect(summary.containers[0]?.state).toBe('running');
  });

  it('maps waiting container message', () => {
    const pod: k8s.V1Pod = {
      metadata: { name: 'weather-api-abc', namespace: 'default' },
      status: {
        phase: 'Pending',
        containerStatuses: [
          {
            name: 'api',
            ready: false,
            restartCount: 0,
            image: 'weather-api:latest',
            state: {
              waiting: {
                reason: 'ImagePullBackOff',
                message: 'Back-off pulling image "weather-api:latest"',
              },
            },
          },
        ],
      },
    };

    const summary = mapper.toSummary(pod);

    expect(summary.containers[0]?.state).toBe('ImagePullBackOff');
    expect(summary.containers[0]?.waitingMessage).toBe(
      'Back-off pulling image "weather-api:latest"',
    );
  });
});
