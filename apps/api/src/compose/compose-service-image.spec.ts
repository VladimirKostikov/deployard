import { describe, expect, it } from 'vitest';
import { resolveServiceImage } from './compose-service-image';

describe('resolveServiceImage', () => {
  it('prefers image override for service', () => {
    const image = resolveServiceImage(
      'demo-api',
      ['demo-shop-api:latest'],
      [],
      { 'demo-api': 'demo-shop-api:local' },
    );

    expect(image).toBe('demo-shop-api:local');
  });

  it('matches seed-compatible image names for demo-api', () => {
    const image = resolveServiceImage(
      'demo-api',
      ['demo-shop-api:latest', 'demo-shop-web:latest'],
      [],
    );

    expect(image).toBe('demo-shop-api:latest');
  });

  it('matches compose service overrides for aliased deployment names', () => {
    const image = resolveServiceImage(
      'demo-web',
      ['demo-shop-web:local'],
      [],
      { web: 'demo-shop-web:local' },
      { projectName: 'demo-shop' },
    );

    expect(image).toBe('demo-shop-web:local');
  });
});
