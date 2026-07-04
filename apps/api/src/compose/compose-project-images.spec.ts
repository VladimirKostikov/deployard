import { describe, expect, it } from 'vitest';
import { findServiceBuiltImage } from './compose-project-images';

describe('compose-project-images', () => {
  it('finds seed-compatible image for demo-api service', () => {
    const image = findServiceBuiltImage(
      'demo-api',
      ['demo-shop-api:latest', 'demo-shop-web:latest'],
      'demo-shop',
    );

    expect(image).toBe('demo-shop-api:latest');
  });

  it('matches service name inside project prefixed repository', () => {
    const image = findServiceBuiltImage(
      'web',
      ['demo-shop-api:latest', 'demo-shop-web:latest'],
      'demo-shop',
    );

    expect(image).toBe('demo-shop-web:latest');
  });
});
