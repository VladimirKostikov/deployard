import * as k8s from '@kubernetes/client-node';

export type ProbeKind = 'http' | 'tcp' | 'none';

export interface ResolvedContainerSetup {
  containerPort: number;
  probeKind: ProbeKind;
  probePort: number;
}

const TCP_IMAGE_PORTS: Array<{ pattern: RegExp; port: number }> = [
  { pattern: /redis|valkey|dragonfly/i, port: 6379 },
  { pattern: /postgres|timescale/i, port: 5432 },
  { pattern: /mariadb|mysql/i, port: 3306 },
  { pattern: /mongo/i, port: 27017 },
  { pattern: /rabbitmq/i, port: 5672 },
  { pattern: /elasticsearch/i, port: 9200 },
  { pattern: /cockroach/i, port: 26257 },
  { pattern: /clickhouse/i, port: 8123 },
  { pattern: /influxdb/i, port: 8086 },
  { pattern: /neo4j/i, port: 7474 },
  { pattern: /cassandra/i, port: 9042 },
  { pattern: /memcached/i, port: 11211 },
  { pattern: /mosquitto|emqx|vernemq/i, port: 1883 },
  { pattern: /nats/i, port: 4222 },
  { pattern: /etcd/i, port: 2379 },
  { pattern: /zookeeper/i, port: 2181 },
  { pattern: /couchdb/i, port: 5984 },
  { pattern: /arangodb/i, port: 8529 },
  { pattern: /qdrant/i, port: 6333 },
  { pattern: /milvus/i, port: 19530 },
  { pattern: /mssql|sqlserver/i, port: 1433 },
  { pattern: /oracle/i, port: 1521 },
  { pattern: /kafka|redpanda/i, port: 9092 },
  { pattern: /pulsar/i, port: 6650 },
  { pattern: /ollama/i, port: 11434 },
];

const HTTP_IMAGE_PATTERN =
  /nginx|httpd|caddy|traefik|wordpress|grafana|prometheus|jaeger|php.*apache|minio|nextcloud|mediawiki|matomo|gitlab|ghost|portainer|sonarqube|keycloak|jenkins|drone|argocd|joomla|drupal|moodle|discourse|jitsi|vaultwarden|bookstack|outline|superset|metabase|swagger|jupyter|code-server|open-webui|localai|langfuse|uptime-kuma|signoz|netdata|kibana|directus|strapi|odoo|rocket\.chat|paperless|emby|jellyfin|plex|radarr|sonarr|transmission|authelia|oauth2-proxy/i;

export function resolveContainerSetup(
  image: string,
  requestedPort?: number,
): ResolvedContainerSetup {
  const normalized = image.toLowerCase();

  for (const entry of TCP_IMAGE_PORTS) {
    if (entry.pattern.test(normalized)) {
      return {
        containerPort: entry.port,
        probeKind: 'tcp',
        probePort: entry.port,
      };
    }
  }

  const port = requestedPort ?? 80;
  const httpLikely =
    HTTP_IMAGE_PATTERN.test(normalized) || port === 80 || port === 8080 || port === 3000;

  if (httpLikely) {
    return {
      containerPort: port,
      probeKind: 'http',
      probePort: port,
    };
  }

  return {
    containerPort: port,
    probeKind: 'none',
    probePort: port,
  };
}

export function buildProbes(
  probeKind: ProbeKind,
  probePort: number,
  timing?: {
    readinessInitialDelaySeconds?: number;
    livenessInitialDelaySeconds?: number;
    httpPath?: string;
  },
): Pick<k8s.V1Container, 'readinessProbe' | 'livenessProbe'> {
  if (probeKind === 'none') {
    return {};
  }

  const probeTarget =
    probeKind === 'http'
      ? { httpGet: { path: timing?.httpPath ?? '/', port: probePort } }
      : { tcpSocket: { port: probePort } };

  return {
    readinessProbe: {
      ...probeTarget,
      initialDelaySeconds: timing?.readinessInitialDelaySeconds ?? 2,
      periodSeconds: 5,
    },
    livenessProbe: {
      ...probeTarget,
      initialDelaySeconds: timing?.livenessInitialDelaySeconds ?? 5,
      periodSeconds: 10,
    },
  };
}
