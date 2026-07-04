import { describe, expect, it } from 'vitest';
import { defaultLocalImageTag, mergeLocalImageOverrides } from './import-local-images';

describe('import-local-images', () => {
  it('fills missing build service overrides with project-scoped local tags', () => {
    const merged = mergeLocalImageOverrides(['weather-api', 'weather-web'], {
      'weather-api': 'weather-station-weather-api:local',
    }, 'weather-station');

    expect(merged).toEqual({
      'weather-api': 'weather-station-weather-api:local',
      'weather-web': 'weather-station-weather-web:local',
    });
  });

  it('uses seed-compatible local tags for demo-shop', () => {
    expect(defaultLocalImageTag('demo-api', 'demo-shop')).toBe('demo-shop-api:local');
    expect(defaultLocalImageTag('web', 'demo-shop')).toBe('demo-shop-web:local');
    expect(defaultLocalImageTag('weather-api')).toBe('weather-api:local');
  });

  it('upgrades unscoped local tags when project name is known', () => {
    const merged = mergeLocalImageOverrides(
      ['demo-api', 'web'],
      { 'demo-api': 'demo-api:local', web: 'web:local' },
      'demo-shop',
    );

    expect(merged).toEqual({
      'demo-api': 'demo-shop-api:local',
      web: 'demo-shop-web:local',
    });
  });
});
