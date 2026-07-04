import { describe, expect, it } from 'vitest';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000/api';
const namespace = process.env.TEST_NAMESPACE ?? 'default';
const deploymentName = process.env.TEST_DEPLOYMENT ?? 'demo-api';

describe('Deploy webhook API', () => {
  it('POST /webhooks/deploy rejects missing secret', async () => {
    const response = await fetch(`${baseUrl}/webhooks/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace,
        deployment: deploymentName,
        image: 'demo-shop-api:local',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('POST /webhooks/deploy rejects invalid secret', async () => {
    const response = await fetch(`${baseUrl}/webhooks/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Deploy-Secret': 'wrong-secret',
      },
      body: JSON.stringify({
        namespace,
        deployment: deploymentName,
        image: 'demo-shop-api:local',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('POST /webhooks/deploy accepts valid secret', async () => {
    const secret = process.env.DEPLOY_WEBHOOK_SECRET ?? 'dev-deploy-webhook-secret';
    const response = await fetch(`${baseUrl}/webhooks/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Deploy-Secret': secret,
      },
      body: JSON.stringify({
        namespace,
        deployment: deploymentName,
        image: 'demo-shop-api:local',
        action: 'update_image',
      }),
    });

    expect(response.ok).toBe(true);
    const body = (await response.json()) as { ok: boolean; deployment: string };
    expect(body.ok).toBe(true);
    expect(body.deployment).toBe(deploymentName);
  });
});
