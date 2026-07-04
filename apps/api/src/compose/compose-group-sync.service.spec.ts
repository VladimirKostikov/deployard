import { describe, expect, it } from 'vitest';
import { composeServiceNameFromResourceName } from '@dpd/shared';
import { isBuildDeployment, resolveImagesToLoad } from './compose-group-sync.helpers';

describe('compose group sync helpers', () => {
  it('loads only tagged build images, not pulled dependencies', () => {
    const images = resolveImagesToLoad(
      ['postgres:16-alpine', 'demo-shop-web:local', 'demo-shop-api:local'],
      ['demo-shop-web:local', 'demo-shop-api:local'],
      ['demo-api', 'web'],
    );

    expect(images).toEqual(['demo-shop-web:local', 'demo-shop-api:local']);
  });

  it('skips postgres during cluster sync', () => {
    const buildServices = ['demo-api', 'web'];

    expect(isBuildDeployment('demo-db', 'demo-shop', buildServices)).toBe(false);
    expect(isBuildDeployment('demo-web', 'demo-shop', buildServices)).toBe(true);
    expect(isBuildDeployment('demo-api', 'demo-shop', buildServices)).toBe(true);
    expect(composeServiceNameFromResourceName('demo-shop', 'demo-api')).toBe('demo-api');
  });
});
