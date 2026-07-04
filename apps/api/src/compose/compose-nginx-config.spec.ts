import { composeK8sResourceName } from '@dpd/shared';
import { describe, expect, it } from 'vitest';
import {
  attachComposeNginxConfigs,
  buildComposeNginxConfig,
  resolveComposeNginxUpstream,
} from './compose-nginx-config';
import { ComposeK8sServicePlan } from './compose-plan.types';

function plan(partial: Partial<ComposeK8sServicePlan> & Pick<ComposeK8sServicePlan, 'name'>): ComposeK8sServicePlan {
  const resourceName = partial.resourceName ?? composeK8sResourceName('demo-shop', partial.name);

  return {
    name: partial.name,
    resourceName,
    image: 'demo:latest',
    containerPort: 80,
    replicas: 1,
    dependsOn: [],
    environment: {},
    volumeMounts: [],
    pvcNames: [],
    hasBuild: true,
    createService: true,
    localImage: true,
    ...partial,
    resourceName: partial.resourceName ?? resourceName,
  };
}

describe('compose-nginx-config', () => {
  it('detects API upstream for web frontends', () => {
    const services = [
      plan({ name: 'postgres', containerPort: 5432, hasBuild: false }),
      plan({ name: 'demo-api', containerPort: 3000 }),
      plan({ name: 'web', containerPort: 80, dependsOn: ['demo-api'] }),
    ];

    expect(resolveComposeNginxUpstream(services[2], services)).toEqual({
      host: 'demo-api',
      port: 3000,
    });
  });

  it('builds nginx config with dynamic resolver', () => {
    const config = buildComposeNginxConfig({ host: 'demo-api', port: 3000 }, '10.96.0.10', 'demo');

    expect(config).toContain('resolver 10.96.0.10');
    expect(config).toContain('set $api_upstream demo-api.demo.svc.cluster.local:3000');
    expect(config).toContain('proxy_pass http://$api_upstream$request_uri');
  });

  it('attaches config map metadata to proxy frontends', () => {
    const services = [
      plan({ name: 'demo-api', containerPort: 3000 }),
      plan({ name: 'web', containerPort: 80, dependsOn: ['demo-api'] }),
    ];

    attachComposeNginxConfigs(services);

    expect(services[1].nginxConfigMapName).toBe('demo-web-nginx');
    expect(services[1].nginxUpstream).toEqual({ host: 'demo-api', port: 3000 });
  });
});
