import { describe, expect, it } from 'vitest';
import type { ClusterSummary } from '@dpd/shared';
import { apiFetch } from './api-client';

describe('Clusters API', () => {
  it('GET /clusters returns at least one context', async () => {
    const clusters = await apiFetch<ClusterSummary[]>('/clusters');

    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters.some((item) => item.current)).toBe(true);
  });
});
