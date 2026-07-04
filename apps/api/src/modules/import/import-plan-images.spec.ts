import { describe, expect, it } from 'vitest';
import { collectImportImages } from './import-plan-images';

describe('collectImportImages', () => {
  it('collects unique images from services and overrides', () => {
    const images = collectImportImages(
      [
        {
          name: 'weather-api',
          image: 'weather-api:latest',
          containerPort: 8080,
          replicas: 1,
          environment: {},
          volumeMounts: [],
          pvcNames: [],
          dependsOn: [],
          createService: true,
          hasBuild: true,
        },
        {
          name: 'weather-web',
          image: 'weather-web:latest',
          containerPort: 80,
          replicas: 1,
          environment: {},
          volumeMounts: [],
          pvcNames: [],
          dependsOn: [],
          createService: true,
          hasBuild: true,
        },
      ],
      { 'weather-api': 'weather-api:local' },
    );

    expect(images).toEqual(['weather-api:local', 'weather-web:latest']);
  });
});
