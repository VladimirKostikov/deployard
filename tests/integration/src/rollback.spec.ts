import { describe, expect, it } from 'vitest';
import type { DeploymentSummary } from '@dpd/shared';
import { apiFetch } from './api-client';

const namespace = process.env.TEST_NAMESPACE ?? 'default';
const deploymentName = process.env.TEST_DEPLOYMENT ?? 'demo-api';

describe('Deployments rollback API', () => {
  it('POST /deployments/:name/rollback restores previous revision', async () => {
    const before = await apiFetch<DeploymentSummary>(
      `/deployments/${deploymentName}?namespace=${namespace}`,
    );
    const historyBefore = await apiFetch<Array<{ revision: number; image: string }>>(
      `/deployments/${deploymentName}/history?namespace=${namespace}`,
    );
    const previousRevision = historyBefore[0]?.revision;
    expect(previousRevision).toBeGreaterThan(0);

    await apiFetch(`/deployments/${deploymentName}/restart?namespace=${namespace}`, {
      method: 'POST',
    });

    const historyAfterRestart = await apiFetch<Array<{ revision: number }>>(
      `/deployments/${deploymentName}/history?namespace=${namespace}`,
    );
    expect(historyAfterRestart[0]?.revision).toBeGreaterThan(previousRevision);

    const rolledBack = await apiFetch<DeploymentSummary>(
      `/deployments/${deploymentName}/rollback?namespace=${namespace}`,
      {
        method: 'POST',
        body: JSON.stringify({ revision: previousRevision }),
      },
    );

    expect(rolledBack.name).toBe(deploymentName);
    expect(rolledBack.image).toBe(before.image);
  });
});
