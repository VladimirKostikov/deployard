import { describe, expect, it } from 'vitest';
import type { PodSummary } from '@dpd/shared';
import { apiFetch } from './api-client';

const namespace = process.env.TEST_NAMESPACE ?? 'default';
const deployment = process.env.TEST_DEPLOYMENT ?? 'demo-api';

describe('Pods API', () => {
  it('GET /pods returns pods for deployment', async () => {
    const pods = await apiFetch<PodSummary[]>(
      `/pods?namespace=${namespace}&deployment=${deployment}`,
    );

    expect(pods.length).toBeGreaterThan(0);
    expect(pods[0].name).toContain(deployment);
    expect(pods[0].namespace).toBe(namespace);
  });
});
