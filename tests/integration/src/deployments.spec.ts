import { describe, expect, it } from 'vitest';
import type { DeploymentSummary, NamespaceSummary } from '@dpd/shared';
import { apiFetch } from './api-client';

const namespace = process.env.TEST_NAMESPACE ?? 'default';

describe('Namespaces API', () => {
  it('GET /namespaces returns at least default', async () => {
    const namespaces = await apiFetch<NamespaceSummary[]>('/namespaces');
    expect(namespaces.length).toBeGreaterThan(0);
    expect(namespaces.some((item) => item.name === 'default')).toBe(true);
  });
});

describe('Deployments API', () => {
  it('GET /deployments lists demo-api in default namespace', async () => {
    const deployments = await apiFetch<DeploymentSummary[]>(`/deployments?namespace=${namespace}`);
    const demoApi = deployments.find((item) => item.name === 'demo-api');

    expect(demoApi).toBeDefined();
    expect(demoApi?.namespace).toBe(namespace);
    expect(demoApi?.replicas).toBeGreaterThan(0);
  });

  it('GET /deployments/:name returns deployment detail', async () => {
    const deployment = await apiFetch<DeploymentSummary>(
      `/deployments/demo-api?namespace=${namespace}`,
    );

    expect(deployment.name).toBe('demo-api');
    expect(deployment.image).toContain('demo-shop-api');
  });

  it('GET /deployments/:name/history returns revisions', async () => {
    const history = await apiFetch<Array<{ revision: number }>>(
      `/deployments/demo-api/history?namespace=${namespace}`,
    );

    expect(history.length).toBeGreaterThan(0);
    expect(history[0].revision).toBeGreaterThan(0);
  });

  it('POST disable and enable toggles deployment', async () => {
    const before = await apiFetch<DeploymentSummary>(
      `/deployments/demo-api?namespace=${namespace}`,
    );
    const originalReplicas = before.replicas;

    const disabled = await apiFetch<DeploymentSummary>(
      `/deployments/demo-api/disable?namespace=${namespace}`,
      { method: 'POST' },
    );

    expect(disabled.replicas).toBe(0);
    expect(disabled.disabled).toBe(true);
    expect(disabled.previousReplicas).toBe(originalReplicas);

    const enabled = await apiFetch<DeploymentSummary>(
      `/deployments/demo-api/enable?namespace=${namespace}`,
      { method: 'POST' },
    );

    expect(enabled.replicas).toBe(originalReplicas);
    expect(enabled.disabled).toBe(false);
  });
});
