import * as k8s from '@kubernetes/client-node';

export interface ContainerRuntimeDefaults {
  env: k8s.V1EnvVar[];
  readinessInitialDelaySeconds: number;
  livenessInitialDelaySeconds: number;
  hint?: string;
}

const EMPTY_DEFAULTS: ContainerRuntimeDefaults = {
  env: [],
  readinessInitialDelaySeconds: 2,
  livenessInitialDelaySeconds: 5,
};

const IMAGE_DEFAULTS: Array<{ pattern: RegExp; defaults: ContainerRuntimeDefaults }> = [
  {
    pattern: /mysql/i,
    defaults: {
      env: [
        { name: 'MYSQL_ROOT_PASSWORD', value: 'dev-root-password' },
        { name: 'MYSQL_DATABASE', value: 'app' },
      ],
      readinessInitialDelaySeconds: 20,
      livenessInitialDelaySeconds: 45,
      hint: 'MySQL requires MYSQL_ROOT_PASSWORD. Dev defaults are prefilled for local clusters.',
    },
  },
  {
    pattern: /mariadb/i,
    defaults: {
      env: [
        { name: 'MARIADB_ROOT_PASSWORD', value: 'dev-root-password' },
        { name: 'MARIADB_DATABASE', value: 'app' },
      ],
      readinessInitialDelaySeconds: 20,
      livenessInitialDelaySeconds: 45,
      hint: 'MariaDB requires MARIADB_ROOT_PASSWORD. Dev defaults are prefilled for local clusters.',
    },
  },
  {
    pattern: /postgres/i,
    defaults: {
      env: [
        { name: 'POSTGRES_PASSWORD', value: 'dev-password' },
        { name: 'POSTGRES_USER', value: 'app' },
        { name: 'POSTGRES_DB', value: 'app' },
      ],
      readinessInitialDelaySeconds: 10,
      livenessInitialDelaySeconds: 30,
      hint: 'PostgreSQL needs POSTGRES_PASSWORD and POSTGRES_USER.',
    },
  },
  {
    pattern: /mongo/i,
    defaults: {
      env: [
        { name: 'MONGO_INITDB_ROOT_USERNAME', value: 'root' },
        { name: 'MONGO_INITDB_ROOT_PASSWORD', value: 'dev-password' },
      ],
      readinessInitialDelaySeconds: 15,
      livenessInitialDelaySeconds: 40,
    },
  },
  {
    pattern: /elasticsearch/i,
    defaults: {
      env: [
        { name: 'discovery.type', value: 'single-node' },
        { name: 'xpack.security.enabled', value: 'false' },
      ],
      readinessInitialDelaySeconds: 30,
      livenessInitialDelaySeconds: 60,
    },
  },
];

export function resolveContainerRuntimeDefaults(image: string): ContainerRuntimeDefaults {
  const normalized = image.toLowerCase();

  for (const entry of IMAGE_DEFAULTS) {
    if (entry.pattern.test(normalized)) {
      return entry.defaults;
    }
  }

  return EMPTY_DEFAULTS;
}
