import { describe, expect, it } from 'vitest';
import { buildComposeDeploymentBody } from './compose-deployment.builder';

describe('buildComposeDeploymentBody', () => {
  it('builds deployment with part-of label and container image', () => {
    const body = buildComposeDeploymentBody(
      'default',
      {
        name: 'weather-api',
        resourceName: 'weather-station-weather-api',
        image: 'weather-api:latest',
        containerPort: 8080,
        replicas: 1,
        environment: { PORT: '8080' },
        volumeMounts: [],
        pvcNames: [],
        dependsOn: [],
        createService: true,
        hasBuild: true,
        localImage: false,
        healthcheck: undefined,
      },
      'weather-station',
    );

    expect(body.metadata?.name).toBe('weather-station-weather-api');
    expect(body.metadata?.labels?.['app.kubernetes.io/part-of']).toBe('weather-station');
    expect(body.spec?.template?.spec?.containers?.[0]?.image).toBe('weather-api:latest');
    expect(body.spec?.template?.spec?.containers?.[0]?.envFrom?.[0]?.secretRef?.name).toBe(
      'weather-station-weather-api-env',
    );
  });
});
