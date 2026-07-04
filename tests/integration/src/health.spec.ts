import { describe, expect, it } from 'vitest';
import type { HealthResponse, ReadyResponse } from '@dpd/shared';
import { apiFetch } from './api-client';

describe('Health API', () => {
  it('GET /health returns ok', async () => {
    const response = await apiFetch<HealthResponse>('/health');
    expect(response.status).toBe('ok');
    expect(response.timestamp).toBeTruthy();
  });

  it('GET /health/ready returns cluster readiness', async () => {
    const response = await apiFetch<ReadyResponse>('/health/ready');
    expect(['ready', 'not_ready']).toContain(response.status);
    expect(typeof response.k8s).toBe('boolean');
  });
});
