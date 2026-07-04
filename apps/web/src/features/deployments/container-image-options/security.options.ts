import { ContainerImageOption } from './types';

export const securityImageOptions: ContainerImageOption[] = [
  { name: 'Authelia', image: 'authelia/authelia:4.38.10', category: 'Security', icon: 'authelia', defaultPort: 9091 },
  { name: 'CrowdSec', image: 'crowdsecurity/crowdsec:v1.6.3', category: 'Security', icon: 'crowdsec', defaultPort: 8080 },
  { name: 'Fail2ban UI', image: 'crazymax/fail2ban-ui:1.0.0', category: 'Security', icon: 'fail2ban', defaultPort: 8080 },
  { name: 'OAuth2 Proxy', image: 'quay.io/oauth2-proxy/oauth2-proxy:v7.7.1', category: 'Security', icon: 'oauth', defaultPort: 4180 },
  { name: 'OpenBao', image: 'quay.io/openbao/openbao:2.1.0', category: 'Security', icon: 'vault', defaultPort: 8200 },
  { name: 'Trivy Server', image: 'aquasec/trivy:0.58.0', category: 'Security', icon: 'aquasec', defaultPort: 4954 },
  { name: 'WireGuard', image: 'linuxserver/wireguard:1.0.20210914', category: 'Security', icon: 'wireguard', defaultPort: 51820 },
];
