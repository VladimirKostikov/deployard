import { describe, expect, it, vi } from 'vitest';
import { ComposeGroupSyncService } from './compose-group-sync.service';
import type { ClusterImageLoadService } from './cluster-image-load.service';
import type { IDeploymentsRepository } from '../k8s/interfaces/deployments.repository.interface';

describe('ComposeGroupSyncService', () => {
  it('restarts every active deployment in the group after compose rebuild sync', async () => {
    const deploymentsRepository = {
      list: vi.fn().mockResolvedValue([
        {
          name: 'demo-api',
          partOf: 'demo-shop',
          image: 'demo-shop-api:local',
          disabled: false,
        },
        {
          name: 'demo-web',
          partOf: 'demo-shop',
          image: 'demo-shop-web:local',
          disabled: false,
        },
        {
          name: 'demo-db',
          partOf: 'demo-shop',
          image: 'postgres:16-alpine',
          disabled: false,
        },
      ]),
      updateImage: vi.fn().mockResolvedValue({}),
      restart: vi.fn().mockResolvedValue({}),
    } as unknown as IDeploymentsRepository;

    const clusterImageLoadService = {
      isKindAvailable: () => true,
      loadImages: () => ({ loaded: ['demo-shop-api:local', 'demo-shop-web:local'], failed: [] }),
    } as unknown as ClusterImageLoadService;

    const service = new ComposeGroupSyncService(deploymentsRepository, clusterImageLoadService);
    const lines: string[] = [];

    const result = await service.syncGroup(
      'default',
      'demo-shop',
      ['demo-shop-api:local', 'demo-shop-web:local'],
      ['demo-shop-api:local', 'demo-shop-web:local'],
      { 'demo-api': 'demo-shop-api:local', web: 'demo-shop-web:local' },
      (line) => lines.push(line),
      { buildServiceNames: ['demo-api', 'web'] },
    );

    expect(result.deploymentsRestarted).toEqual(['demo-api', 'demo-web', 'demo-db']);
    expect(deploymentsRepository.restart).toHaveBeenCalledTimes(3);
    expect(lines.some((line) => line.includes('Restarted demo-api'))).toBe(true);
  });
});
