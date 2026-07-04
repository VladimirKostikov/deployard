import { describe, expect, it, vi } from 'vitest';
import { composeK8sResourceName } from '@dpd/shared';
import { ComposeOrphanPruneService } from './compose-orphan-prune.service';

describe('ComposeOrphanPruneService', () => {
  it('removes deployments that are no longer in compose plan', async () => {
    const k8sService = {
      apps: {
        listNamespacedDeployment: vi.fn().mockResolvedValue({
          items: [
            { metadata: { name: 'demo-web' } },
            { metadata: { name: 'demo-api' } },
            { metadata: { name: 'demo-shop-legacy' } },
            { metadata: { name: 'demo-shop-postgres' } },
          ],
        }),
      },
    };

    const deleteByNames = vi.fn().mockResolvedValue({ partOf: 'demo-shop', namespace: 'default', deleted: [] });
    const configMapsRepository = { deleteIfExists: vi.fn().mockResolvedValue(false) };
    const lines: string[] = [];

    const service = new ComposeOrphanPruneService(
      k8sService as never,
      { resolveStatusCode: () => 404 } as never,
      { deleteByNames } as never,
      configMapsRepository as never,
    );

    const removed = await service.prune(
      'default',
      'demo-shop',
      [
        {
          name: 'web',
          resourceName: composeK8sResourceName('demo-shop', 'web'),
        } as never,
        {
          name: 'demo-api',
          resourceName: composeK8sResourceName('demo-shop', 'demo-api'),
        } as never,
      ],
      (line) => lines.push(line),
    );

    expect(removed).toEqual(['demo-shop-legacy', 'demo-shop-postgres']);
    expect(deleteByNames).toHaveBeenCalledWith('default', 'demo-shop', [
      'demo-shop-legacy',
      'demo-shop-postgres',
    ]);
  });
});
