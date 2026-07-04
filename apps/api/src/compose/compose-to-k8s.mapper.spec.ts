import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ComposeParserService } from './compose-parser.service';
import { ComposeToK8sMapper } from './compose-to-k8s.mapper';

describe('ComposeToK8sMapper', () => {
  const mapper = new ComposeToK8sMapper(new ComposeParserService());
  const demoCompose = readFileSync(
    resolve(__dirname, '../../../../demo/demo-shop/compose.yml'),
    'utf8',
  );

  it('orders services by depends_on', () => {
    const plan = mapper.buildPlan(demoCompose, 'default');
    expect(plan.services.map((service) => service.name)[0]).toBe('postgres');
  });

  it('uses image overrides for build services', () => {
    const plan = mapper.buildPlan(demoCompose, 'default', {
      'demo-api': 'demo-shop-api:local',
      web: 'demo-shop-web:local',
    });

    const demoApi = plan.services.find((service) => service.name === 'demo-api');
    expect(demoApi?.image).toBe('demo-shop-api:local');
    expect(demoApi?.resourceName).toBe('demo-api');
    expect(plan.warnings.some((warning) => warning.code === 'BUILD_REQUIRES_IMAGE')).toBe(false);
  });

  it('defaults build service images to project scoped local tags', () => {
    const plan = mapper.buildPlan(demoCompose, 'default');

    const demoApi = plan.services.find((service) => service.name === 'demo-api');
    const web = plan.services.find((service) => service.name === 'web');
    const postgres = plan.services.find((service) => service.name === 'postgres');

    expect(demoApi?.image).toBe('demo-shop-api:local');
    expect(demoApi?.resourceName).toBe('demo-api');
    expect(web?.image).toBe('demo-shop-web:local');
    expect(web?.resourceName).toBe('demo-web');
    expect(postgres?.resourceName).toBe('demo-db');
  });

  it('prepares nginx proxy config for web frontends', () => {
    const plan = mapper.buildPlan(demoCompose, 'default');
    const web = plan.services.find((service) => service.name === 'web');

    expect(web?.resourceName).toBe('demo-web');
    expect(web?.nginxConfigMapName).toBe('demo-web-nginx');
    expect(web?.nginxUpstream).toEqual({ host: 'demo-api', port: 3000 });
  });

  it('infers API port from PORT env for services without compose ports', () => {
    const orderHubCompose = readFileSync(
      resolve(__dirname, '../../../../demo/order-hub/compose.yml'),
      'utf8',
    );
    const plan = mapper.buildPlan(orderHubCompose, 'demo');
    const gateway = plan.services.find((service) => service.name === 'hub-gateway');
    const web = plan.services.find((service) => service.name === 'web');

    expect(gateway?.containerPort).toBe(3000);
    expect(gateway?.nginxConfigMapName).toBeUndefined();
    expect(web?.nginxUpstream).toEqual({ host: 'order-hub-hub-gateway', port: 3000 });
    expect(web?.nginxConfigMapName).toBe('order-hub-web-nginx');
  });
});
