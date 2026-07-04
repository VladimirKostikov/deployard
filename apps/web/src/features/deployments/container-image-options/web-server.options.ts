import { ContainerImageOption } from './types';

export const webServerImageOptions: ContainerImageOption[] = [
  { name: 'Angie', image: 'docker.angie.software/angie:1.9.0-alpine', category: 'Web server', icon: 'nginx', defaultPort: 80 },
  { name: 'Caddy', image: 'caddy:2.9-alpine', category: 'Web server', icon: 'caddy', defaultPort: 80 },
  { name: 'Emissary', image: 'docker.io/emissaryingress/emissary:3.9.1', category: 'Web server', icon: 'envoyproxy', defaultPort: 8080 },
  { name: 'Envoy', image: 'envoyproxy/envoy:v1.33-latest', category: 'Web server', icon: 'envoyproxy', defaultPort: 10000 },
  { name: 'HAProxy', image: 'haproxy:3.0-alpine', category: 'Web server', icon: 'haproxy', defaultPort: 80 },
  { name: 'Apache HTTP Server', image: 'httpd:2.4-alpine', category: 'Web server', icon: 'apache', defaultPort: 80, keywords: ['apache', 'httpd'] },
  { name: 'Apache HTTP Server', image: 'httpd:2.4', category: 'Web server', icon: 'apache', defaultPort: 80, keywords: ['apache', 'httpd'] },
  { name: 'Lighttpd', image: 'sebp/lighttpd:1.4.76-r0', category: 'Web server', icon: 'lighttpd', defaultPort: 80 },
  { name: 'Nginx', image: 'nginx:1.27-alpine', category: 'Web server', icon: 'nginx', defaultPort: 80 },
  { name: 'Nginx', image: 'nginx:1.26-alpine', category: 'Web server', icon: 'nginx', defaultPort: 80 },
  { name: 'Nginx Unit', image: 'nginx/unit:1.34.2-minimal', category: 'Web server', icon: 'nginx', defaultPort: 8080 },
  { name: 'OpenResty', image: 'openresty/openresty:1.25.3-alpine', category: 'Web server', icon: 'nginx', defaultPort: 80 },
  { name: 'Traefik', image: 'traefik:v3.3', category: 'Web server', icon: 'traefikproxy', defaultPort: 80 },
  { name: 'Varnish', image: 'varnish:7.7', category: 'Web server', icon: 'varnish', defaultPort: 80 },
];
