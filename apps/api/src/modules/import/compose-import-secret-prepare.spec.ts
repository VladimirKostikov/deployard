import { describe, expect, it, vi } from 'vitest';
import { prepareComposeServiceSecrets } from './compose-import-secret-prepare';

describe('prepareComposeServiceSecrets', () => {
  it('creates secrets before deployments and migrates legacy -secret names', async () => {
    const upsertOpaque = vi
      .fn()
      .mockResolvedValueOnce('created')
      .mockResolvedValueOnce('updated');
    const secretsRepository = { upsertOpaque } as never;

    const readNamespacedSecret = vi
      .fn()
      .mockRejectedValueOnce({ code: 404 })
      .mockResolvedValueOnce({
        stringData: { POSTGRES_DB: 'shop', POSTGRES_USER: 'shop', POSTGRES_PASSWORD: 'shop' },
      })
      .mockResolvedValue({});

    const k8sService = {
      core: { readNamespacedSecret },
    } as never;

    const services = [
      {
        name: 'postgres',
        resourceName: 'demo-db',
        environment: {
          POSTGRES_DB: 'shop',
          POSTGRES_USER: 'shop',
          POSTGRES_PASSWORD: 'shop',
        },
      },
      {
        name: 'demo-api',
        resourceName: 'demo-api',
        environment: { PORT: '3000' },
      },
    ] as never;

    const applied = await prepareComposeServiceSecrets(
      'default',
      'demo-shop',
      services,
      secretsRepository,
      k8sService,
    );

    expect(upsertOpaque).toHaveBeenCalledTimes(2);
    expect(upsertOpaque).toHaveBeenNthCalledWith(1, 'default', 'demo-db-env', {
      POSTGRES_DB: 'shop',
      POSTGRES_USER: 'shop',
      POSTGRES_PASSWORD: 'shop',
    });
    expect(applied).toEqual([
      { name: 'demo-db-env', action: 'created' },
      { name: 'demo-api-env', action: 'updated' },
    ]);
  });
});
