import type { ComposeK8sServicePlan, ComposeNginxUpstream } from './compose-plan.types';

export type { ComposeNginxUpstream } from './compose-plan.types';

const DATA_STORE_PORTS = new Set([5432, 6379, 3306, 27017]);

export function resolveComposeNginxUpstream(
  service: ComposeK8sServicePlan,
  services: ComposeK8sServicePlan[],
): ComposeNginxUpstream | undefined {
  if (service.containerPort !== 80 && service.containerPort !== 8080) {
    return undefined;
  }

  for (const dependencyName of service.dependsOn) {
    const dependency = services.find((entry) => entry.name === dependencyName);
    if (!dependency || DATA_STORE_PORTS.has(dependency.containerPort)) {
      continue;
    }

    return {
      host: dependency.resourceName,
      port: dependency.containerPort,
    };
  }

  return undefined;
}

export function buildComposeNginxConfig(
  upstream: ComposeNginxUpstream,
  resolverIp: string,
  namespace: string,
): string {
  const target = `${upstream.host}.${namespace}.svc.cluster.local:${upstream.port}`;

  return `server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  resolver ${resolverIp} valid=10s ipv6=off;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /health {
    set $api_upstream ${target};
    proxy_pass http://$api_upstream/health;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
  }

  location /ready {
    set $api_upstream ${target};
    proxy_pass http://$api_upstream/ready;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
  }

  location /api/ {
    set $api_upstream ${target};
    proxy_pass http://$api_upstream$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
  }
}
`;
}

export function attachComposeNginxConfigs(services: ComposeK8sServicePlan[]): void {
  for (const service of services) {
    const upstream = resolveComposeNginxUpstream(service, services);
    if (!upstream) {
      continue;
    }

    service.nginxUpstream = upstream;
    service.nginxConfigMapName = `${service.resourceName}-nginx`;
  }
}
